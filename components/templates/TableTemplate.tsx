"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Table, Form, Button, Spinner, Badge } from "react-bootstrap";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/sessionStore";
import useSWR from "swr";

export type TableTemplateColumn<T> = {
  key: string;
  fieldName?: string;
  label: string;
  type?: "string" | "number" | "date" | "datetime" | "boolean";
  filterable?: boolean;
  accessor: (row: T) => unknown;
  render?: (row: T, index: number) => React.ReactNode;
  groupFormat?: string;
};

type TableApiResponse<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type DomainOperator =
  | "="
  | "!="
  | "contains"
  | "startsWith"
  | "endsWith"
  | "in"
  | "notIn"
  | ">"
  | ">="
  | "<"
  | "<=";

export type DomainItem = [field: string, operator: DomainOperator, value: any];
export type Domain = DomainItem[];

type FilterCondition = {
  id: string;
  field: string;
  operator: DomainOperator;
  value: string;
};

type TableProps<T> = {
  model: string;
  columns: TableTemplateColumn<T>[];
  getRowId: (row: T) => string;
  onSelectionChange?: (ids: Array<string>) => void;
  viewForm?: string;
  pageSize?: number;
  defaultOrder?: string;
  domain?: Domain;
  onRowClick?: (row: T) => void;
  includes?: any;
};

// function useDebouncedValue<T>(value: T, delay = 300) {
//   const [debounced, setDebounced] = useState(value);

//   useEffect(() => {
//     const t = setTimeout(() => setDebounced(value), delay);
//     return () => clearTimeout(t);
//   }, [value, delay]);

//   return debounced;
// }

function parseDefaultOrder(defaultOrder?: string): {
  key: string | null;
  direction: "asc" | "desc";
} {
  if (!defaultOrder?.trim()) {
    return { key: null, direction: "asc" };
  }

  const parts = defaultOrder.trim().split(/\s+/);
  const key = parts[0] ?? null;
  const rawDirection = (parts[1] ?? "asc").toLowerCase();

  return {
    key,
    direction: rawDirection === "desc" ? "desc" : "asc",
  };
}

const fetcher = async <T,>(url: string): Promise<TableApiResponse<T>> => {
  const res = await fetch(url);

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `HTTP ${res.status}`);
  }

  return res.json();
};

const getOperatorsByType = (type?: string): DomainOperator[] => {
  switch (type) {
    case "number":
      return ["=", "!=", ">", ">=", "<", "<="];
    case "date":
      return ["=", "!=", ">", ">=", "<", "<="];
    case "datetime":
      return ["=", "!=", ">", ">=", "<", "<="];
    case "boolean":
      return ["=", "!="];
    default:
      return ["contains", "=", "!=", "startsWith", "endsWith"];
  }
};

const operatorLabels: Record<DomainOperator, string> = {
  "=": "Igual a",
  "!=": "Diferente de",
  contains: "Contiene",
  startsWith: "Empieza con",
  endsWith: "Termina con",
  in: "Está en",
  notIn: "No está en",
  ">": "Mayor que",
  ">=": "Mayor o igual que",
  "<": "Menor que",
  "<=": "Menor o igual que",
};

const formatFilterValue = (value: string, type?: string): string => {
  if (type === "date" && value.match(/^\d{4}-\d{2}-\d{2}/)) {
    const [year, month, day] = value.split("-");
    if (day) return `${day}/${month}/${year}`;
  }
  if (type === "datetime" && value) {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return format(date, "dd/MM/yyyy HH:mm");
      }
    } catch {
      return value;
    }
  }
  return value;
};

export default function TableTemplate<T>({
  model,
  columns,
  getRowId,
  onSelectionChange,
  viewForm,
  pageSize: pageSizeProp = 20,
  defaultOrder,
  domain: externalDomain,
  onRowClick,
  includes,
}: TableProps<T>) {
  const router = useRouter();

  const modelName = viewForm?.split("?")[0].split("/")[2];
  const { access } = useAuth();
  const accesProps = access.filter((acc) => acc.entityType === modelName);

  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>(
    [],
  );
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [newFilterField, setNewFilterField] = useState<string>("");
  const [newFilterOperator, setNewFilterOperator] =
    useState<DomainOperator>("contains");
  const [newFilterValue, setNewFilterValue] = useState<string>("");

  // const debouncedFilters = useDebouncedValue(filterConditions, 350);

  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "asc" | "desc";
  }>(() => parseDefaultOrder(defaultOrder));

  const [groupBy, setGroupBy] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<Array<string>>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  const [page, setPage] = useState(1);
  const pageSize = pageSizeProp;

  useEffect(() => {
    onSelectionChange?.(selectedIds);
  }, [selectedIds, onSelectionChange]);

  useEffect(() => {
    setSortConfig(parseDefaultOrder(defaultOrder));
    setPage(1);
  }, [defaultOrder]);

  useEffect(() => {
    setPage(1);
  }, [JSON.stringify(externalDomain)]);

  const visibleColumns = useMemo(() => {
    return columns.filter(() => true);
  }, [columns]);

  const fieldsParam = useMemo(() => {
    const keys = new Set<string>();

    for (const c of columns) keys.add(c.key);

    keys.add("id");

    return Array.from(keys).join(",");
  }, [columns]);

  const serializedDomain = useMemo(() => {
    const domainFromConditions: Domain = filterConditions
      .filter((fc) => fc.field && fc.value)
      .map((fc) => [fc.field, fc.operator, fc.value]);

    const allDomain = [...(externalDomain || []), ...domainFromConditions];
    return JSON.stringify(allDomain);
  }, [externalDomain, filterConditions]);

  const buildUrl = useMemo(() => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    params.set("fields", fieldsParam);

    if (sortConfig.key) {
      params.set("sortKey", sortConfig.key);
      params.set("sortDir", sortConfig.direction);
    }

    params.set("domain", serializedDomain);
    params.set("includes", JSON.stringify(includes ?? {}));

    return `/api/tables/${model}?${params.toString()}`;
  }, [
    model,
    page,
    pageSize,
    fieldsParam,
    sortConfig.key,
    sortConfig.direction,
    serializedDomain,
    includes,
  ]);

  const { data, error, isLoading } = useSWR<TableApiResponse<T>>(
    buildUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    },
  );

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleHeaderDoubleClick = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
    setPage(1);
  };

  const handleAddFilter = () => {
    if (!newFilterField || !newFilterValue) return;

    let finalValue = newFilterValue;
    const columnType = getColumnByKey(newFilterField)?.type;

    if (columnType === "date" || columnType === "datetime") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(newFilterValue)) {
        finalValue = `${newFilterValue}T00:00:00.000Z`;
      } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(newFilterValue)) {
        finalValue = `${newFilterValue}:00.000Z`;
      } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(newFilterValue)) {
        finalValue = `${newFilterValue}.000Z`;
      }
    }

    const newCondition: FilterCondition = {
      id: crypto.randomUUID(),
      field: newFilterField,
      operator: newFilterOperator,
      value: finalValue,
    };

    setFilterConditions([...filterConditions, newCondition]);
    setNewFilterField("");
    setNewFilterOperator("contains");
    setNewFilterValue("");
    setPage(1);
  };

  const handleRemoveFilter = (id: string) => {
    setFilterConditions(filterConditions.filter((fc) => fc.id !== id));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilterConditions([]);
    setPage(1);
  };

  const groupedData = useMemo(() => {
    if (!groupBy) return { null: rows };

    const col = columns.find((c) => c.key === groupBy);
    if (!col) return { null: rows };

    return rows.reduce<Record<string, T[]>>((groups, row) => {
      let val = col.accessor(row);

      if ((col.type === "date" || col.type === "datetime") && val) {
        const d = new Date(String(val));
        if (!isNaN(d.getTime())) val = format(d, col.groupFormat || "yyyy-MM");
      }

      const key = String(val ?? "Sin valor");
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
      return groups;
    }, {});
  }, [rows, groupBy, columns]);

  const paginatedData = useMemo(() => {
    return groupedData;
  }, [groupedData]);

  const toggleGroupBy = (key: string) => {
    if (groupBy === key) {
      setGroupBy(null);
      setCollapsedGroups({});
    } else {
      setGroupBy(key);

      const col = columns.find((c) => c.key === key);
      if (!col) return;

      const groups = rows.reduce<Record<string, boolean>>((acc, row) => {
        let val = col.accessor(row);
        if ((col.type === "date" || col.type === "datetime") && val) {
          const d = new Date(String(val));
          if (!isNaN(d.getTime())) {
            val = format(d, col.groupFormat || "yyyy-MM");
          }
        }
        acc[String(val ?? "Sin valor")] = true;
        return acc;
      }, {});
      setCollapsedGroups(groups);
    }
  };

  const toggleGroupCollapse = (group: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const handleRowSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id),
    );
  };

  const allVisibleIds = Object.entries(paginatedData)
    .filter(([group]) => !(collapsedGroups[group] ?? false))
    .flatMap(([, rws]) => rws.map(getRowId));

  const handleSelectAll = (checked: boolean) => {
    const visibleIds = allVisibleIds;

    if (checked) {
      const hiddenIds = selectedIds.filter((id) => !visibleIds.includes(id));
      setSelectedIds([...hiddenIds, ...visibleIds]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    }
  };

  const getColumnByKey = (key: string) => {
    return columns.find((c) => c.key === key);
  };

  const selectedColumnType = getColumnByKey(newFilterField)?.type;

  return (
    <div className="position-relative">
      {isLoading && (
        <div
          className="position-absolute end-0 top-0 me-2 mt-2 d-flex align-items-center gap-2 text-muted"
          style={{ zIndex: 5 }}
        >
          <Spinner size="sm" />
          <span className="small">Cargando…</span>
        </div>
      )}

      {error && <div className="text-danger small mb-2">{error.message}</div>}

      {/* Panel de filtros */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            <i
              className={`bi ${showFilterPanel ? "bi-eye-slash" : "bi-funnel"}`}
            ></i>{" "}
            {showFilterPanel ? "Ocultar filtros" : "Mostrar filtros"}
            {filterConditions.length > 0 && (
              <Badge bg="primary" className="ms-2">
                {filterConditions.length}
              </Badge>
            )}
          </Button>
          {filterConditions.length > 0 && (
            <Button
              size="sm"
              variant="outline-danger"
              onClick={handleClearFilters}
            >
              <i className="bi bi-trash"></i> Limpiar filtros
            </Button>
          )}
        </div>

        {showFilterPanel && (
          <div className="border rounded p-2">
            {/* Filtros activos */}
            {filterConditions.length > 0 && (
              <div className="mb-3">
                <strong>Filtros activos:</strong>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {filterConditions.map((filter) => {
                    const col = getColumnByKey(filter.field);
                    const displayValue = formatFilterValue(
                      filter.value,
                      col?.type,
                    );
                    return (
                      <Badge
                        key={filter.id}
                        bg="primary"
                        className="d-flex align-items-center gap-2 py-2 px-3"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <span>
                          {col?.label || filter.field}:{" "}
                          {operatorLabels[filter.operator]} &quot;{displayValue}
                          &quot;
                        </span>
                        <i
                          className="bi bi-x-circle-fill"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleRemoveFilter(filter.id)}
                        ></i>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Agregar nuevo filtro */}
            <div className="row g-2 align-items-end">
              <div className="col-auto">
                <Form.Label className="small mb-0">Campo</Form.Label>
                <Form.Select
                  size="sm"
                  value={newFilterField}
                  onChange={(e) => {
                    setNewFilterField(e.target.value);
                    const col = getColumnByKey(e.target.value);
                    if (col) {
                      setNewFilterOperator(getOperatorsByType(col.type)[0]);
                      setNewFilterValue("");
                    }
                  }}
                  style={{ width: "220px" }}
                >
                  <option value="">Seleccionar campo</option>
                  {visibleColumns.map((col) => {
                    const fieldAccess = accesProps.find(
                      (acc) => acc.fieldName === col.fieldName,
                    );
                    if (fieldAccess?.invisible) return null;
                    const typeLabel =
                      col.type === "datetime" ? "datetime" : col.type;
                    return (
                      <option key={col.key} value={col.key}>
                        {col.label} {typeLabel && `(${typeLabel})`}
                      </option>
                    );
                  })}
                </Form.Select>
              </div>

              <div className="col-auto">
                <Form.Label className="small mb-0">Operador</Form.Label>
                <Form.Select
                  size="sm"
                  value={newFilterOperator}
                  onChange={(e) =>
                    setNewFilterOperator(e.target.value as DomainOperator)
                  }
                  style={{ width: "140px" }}
                  disabled={!newFilterField}
                >
                  {getOperatorsByType(selectedColumnType).map((op) => (
                    <option key={op} value={op}>
                      {operatorLabels[op]}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div className="col-auto">
                <Form.Label className="small mb-0">Valor</Form.Label>
                {selectedColumnType === "date" ? (
                  <Form.Control
                    size="sm"
                    type="date"
                    value={newFilterValue}
                    onChange={(e) => setNewFilterValue(e.target.value)}
                    style={{ width: "180px" }}
                    disabled={!newFilterField}
                  />
                ) : selectedColumnType === "datetime" ? (
                  <Form.Control
                    size="sm"
                    type="datetime-local"
                    value={newFilterValue}
                    onChange={(e) => setNewFilterValue(e.target.value)}
                    style={{ width: "220px" }}
                    disabled={!newFilterField}
                  />
                ) : selectedColumnType === "boolean" ? (
                  <Form.Select
                    size="sm"
                    value={newFilterValue}
                    onChange={(e) => setNewFilterValue(e.target.value)}
                    style={{ width: "180px" }}
                    disabled={!newFilterField}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="true">Sí / Verdadero</option>
                    <option value="false">No / Falso</option>
                  </Form.Select>
                ) : (
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Valor a buscar..."
                    value={newFilterValue}
                    onChange={(e) => setNewFilterValue(e.target.value)}
                    style={{ width: "250px" }}
                    disabled={!newFilterField}
                  />
                )}
              </div>

              <div className="col-auto">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleAddFilter}
                  disabled={!newFilterField || !newFilterValue}
                >
                  <i className="bi bi-plus-lg"></i> Agregar filtro
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Table borderless hover size="sm" style={{ fontSize: "0.9rem" }}>
        <thead className="sticky-top" style={{ zIndex: 1 }}>
          <tr>
            <th
              style={{ width: 40, fontSize: "1rem" }}
              className="text-center border-end border-bottom table-active"
            >
              <Form.Check
                type="checkbox"
                checked={
                  allVisibleIds.length > 0 &&
                  allVisibleIds.every((id) => selectedIds.includes(id))
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </th>

            {visibleColumns.map((col) => {
              const fieldAccess = accesProps.find(
                (acc) => acc.fieldName === col.fieldName,
              );
              if (fieldAccess?.invisible) return null;
              return (
                <th
                  key={col.key}
                  style={{ minWidth: 140 }}
                  onDoubleClick={() => handleHeaderDoubleClick(col.key)}
                  className="border-end border-bottom table-active text-nowrap"
                >
                  <div
                    style={{ fontSize: "0.9rem" }}
                    className="d-flex align-items-center justify-content-between gap-1 p-0"
                  >
                    <span title={col.fieldName}>{col.label}</span>

                    <div className="d-flex gap-1">
                      <i
                        className={`bi bi-collection ${groupBy === col.key ? "text-warning" : "text-muted"}`}
                        style={{ cursor: "pointer", fontSize: "0.8rem" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGroupBy(col.key);
                        }}
                        title={`Agrupar por ${col.label}`}
                      />

                      {sortConfig.key === col.key &&
                        (sortConfig.direction === "asc" ? (
                          <i
                            className="bi bi-arrow-bar-up"
                            style={{ fontSize: "0.8rem" }}
                          ></i>
                        ) : (
                          <i
                            className="bi bi-arrow-bar-down"
                            style={{ fontSize: "0.8rem" }}
                          ></i>
                        ))}
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {Object.entries(paginatedData).map(([group, groupRows]) => {
            const isCollapsed = collapsedGroups[group] ?? false;

            return (
              <React.Fragment key={group}>
                {groupBy && (
                  <tr
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleGroupCollapse(group)}
                    className="border-bottom"
                  >
                    <td colSpan={visibleColumns.length + 1} valign="middle">
                      {columns.find((c) => c.key === groupBy)?.label}: {group} (
                      {groupRows.length}){" "}
                      <i
                        className={`bi ${isCollapsed ? "bi-caret-down-fill" : "bi-caret-up-fill"}`}
                      ></i>
                    </td>
                  </tr>
                )}

                {!isCollapsed &&
                  groupRows.map((row) => {
                    const id = getRowId(row);

                    return (
                      <tr
                        key={id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onRowClick) {
                            onRowClick(row);
                            return;
                          }
                          if (viewForm) router.push(`${viewForm}&id=${id}`);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <td
                          className="text-center border-bottom"
                          valign="middle"
                        >
                          <Form.Check
                            type="checkbox"
                            checked={selectedIds.includes(id)}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              handleRowSelect(id, e.target.checked)
                            }
                          />
                        </td>

                        {visibleColumns.map((col, index) => {
                          const fieldAccess = accesProps.find(
                            (acc) => acc.fieldName === col.fieldName,
                          );
                          if (fieldAccess?.invisible) return null;
                          return (
                            <td
                              key={col.key}
                              className="border-bottom text-truncate"
                              valign="middle"
                            >
                              {col.render
                                ? col.render(row, index)
                                : String(col.accessor(row) ?? "")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
              </React.Fragment>
            );
          })}
        </tbody>

        <tfoot className="sticky-bottom">
          {!groupBy && total >= pageSize && (
            <tr>
              <td colSpan={visibleColumns.length + 1}>
                <div className="d-flex justify-content-end align-items-center gap-2">
                  <span className="text-muted small">
                    Página {page} de {totalPages} — {total} registros
                  </span>
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      disabled={page === 1 || isLoading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <i className="bi bi-rewind-fill"></i>
                    </Button>
                    <Button
                      size="sm"
                      disabled={page === totalPages || isLoading}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      <i className="bi bi-fast-forward-fill"></i>
                    </Button>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tfoot>
      </Table>
    </div>
  );
}
