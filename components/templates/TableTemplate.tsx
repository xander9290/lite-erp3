"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Table, Form, Button, Spinner, Badge } from "react-bootstrap";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/sessionStore";
import useSWR from "swr";

// ─── Types ────────────────────────────────────────────────────────────────────

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

export type DomainItem = [
  field: string,
  operator: DomainOperator,
  value: unknown,
];
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
  onSelectionChange?: (ids: string[]) => void;
  viewForm?: string;
  pageSize?: number;
  defaultOrder?: string;
  domain?: Domain;
  onRowClick?: (row: T) => void;
  includes?: Record<string, unknown>;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const OPERATOR_LABELS: Record<DomainOperator, string> = {
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

const STRING_OPERATORS: DomainOperator[] = [
  "contains",
  "=",
  "!=",
  "startsWith",
  "endsWith",
];
const NUMERIC_OPERATORS: DomainOperator[] = ["=", "!=", ">", ">=", "<", "<="];
const BOOL_OPERATORS: DomainOperator[] = ["=", "!="];

function getOperatorsByType(type?: string): DomainOperator[] {
  if (type === "number" || type === "date" || type === "datetime")
    return NUMERIC_OPERATORS;
  if (type === "boolean") return BOOL_OPERATORS;
  return STRING_OPERATORS;
}

function parseDefaultOrder(defaultOrder?: string): {
  key: string | null;
  direction: "asc" | "desc";
} {
  if (!defaultOrder?.trim()) return { key: null, direction: "asc" };
  const [key, rawDir] = defaultOrder.trim().split(/\s+/);
  return {
    key: key ?? null,
    direction: rawDir?.toLowerCase() === "desc" ? "desc" : "asc",
  };
}

function formatFilterValue(value: string, type?: string): string {
  if (type === "date" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }
  if (type === "datetime" && value) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return format(d, "dd/MM/yyyy HH:mm");
  }
  return value;
}

function normalizeDateValue(value: string, type?: string): string {
  if (type !== "date" && type !== "datetime") return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00:00.000Z`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return `${value}:00.000Z`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value))
    return `${value}.000Z`;
  return value;
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetcher<T>(url: string): Promise<TableApiResponse<T>> {
  const res = await fetch(url);
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json() as Promise<TableApiResponse<T>>;
}

// ─── Sub-component: FilterBadge ───────────────────────────────────────────────

type FilterBadgeProps = {
  filter: FilterCondition;
  label: string;
  type?: string;
  onRemove: (id: string) => void;
};

const FilterBadge = React.memo(function FilterBadge({
  filter,
  label,
  type,
  onRemove,
}: FilterBadgeProps) {
  const displayValue = formatFilterValue(filter.value, type);
  return (
    <Badge
      bg="primary"
      className="d-flex align-items-center gap-2 py-2 px-3"
      style={{ fontSize: "0.85rem" }}
    >
      <span>
        {label}: {OPERATOR_LABELS[filter.operator]} &quot;{displayValue}&quot;
      </span>
      <i
        className="bi bi-x-circle-fill"
        style={{ cursor: "pointer" }}
        onClick={() => onRemove(filter.id)}
      />
    </Badge>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

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
  const accesProps = useMemo(
    () => access.filter((acc) => acc.entityType === modelName),
    [access, modelName],
  );

  // ── Filter state ──
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>(
    [],
  );
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [newFilterField, setNewFilterField] = useState("");
  const [newFilterOperator, setNewFilterOperator] =
    useState<DomainOperator>("contains");
  const [newFilterValue, setNewFilterValue] = useState("");

  // ── Sort / group / pagination ──
  const [sortConfig, setSortConfig] = useState(() =>
    parseDefaultOrder(defaultOrder),
  );
  const [groupBy, setGroupBy] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
  const [page, setPage] = useState(1);
  const pageSize = pageSizeProp;

  // ── Infinite scroll state ──
  // Accumulates rows across pages. Reset whenever filters/sort/domain change.
  const [accumulatedRows, setAccumulatedRows] = useState<T[]>([]);
  // Sentinel <tr> at the bottom of tbody — observed by IntersectionObserver
  const sentinelRef = useRef<HTMLTableRowElement>(null);
  // Tracks the last page number already appended to prevent double-appends
  // caused by SWR's stale-while-revalidate behaviour.
  const lastAppendedPageRef = useRef<number>(0);

  // ── Stable ref for external domain comparison ──
  const externalDomainRef = useRef(externalDomain);

  // ── Helper: reset page + accumulated rows (used by every filter/sort handler) ──
  const resetPagination = useCallback(() => {
    setPage(1);
    setAccumulatedRows([]);
    lastAppendedPageRef.current = 0;
  }, []);

  useEffect(() => {
    if (
      JSON.stringify(externalDomainRef.current) !==
      JSON.stringify(externalDomain)
    ) {
      externalDomainRef.current = externalDomain;
      resetPagination();
    }
  }, [externalDomain, resetPagination]);

  useEffect(() => {
    onSelectionChange?.(selectedIds);
  }, [selectedIds, onSelectionChange]);

  useEffect(() => {
    setSortConfig(parseDefaultOrder(defaultOrder));
    resetPagination();
  }, [defaultOrder, resetPagination]);

  // ── Derived / memoized values ──

  const visibleColumns = columns;

  const fieldsParam = useMemo(() => {
    const keys = new Set(columns.map((c) => c.key));
    keys.add("id");
    return Array.from(keys).join(",");
  }, [columns]);

  const serializedDomain = useMemo(() => {
    const fromConditions: Domain = filterConditions
      .filter((fc) => fc.field && fc.value)
      .map((fc) => [fc.field, fc.operator, fc.value]);
    return JSON.stringify([...(externalDomain ?? []), ...fromConditions]);
  }, [externalDomain, filterConditions]);

  const buildUrl = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      fields: fieldsParam,
      domain: serializedDomain,
      includes: JSON.stringify(includes ?? {}),
    });
    if (sortConfig.key) {
      params.set("sortKey", sortConfig.key);
      params.set("sortDir", sortConfig.direction);
    }
    return `/api/tables/${model}?${params.toString()}`;
  }, [
    model,
    page,
    pageSize,
    fieldsParam,
    sortConfig,
    serializedDomain,
    includes,
  ]);

  const { data, error, isLoading } = useSWR<TableApiResponse<T>>(
    buildUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // keepPreviousData prevents layout flash while the next page loads
      keepPreviousData: true,
    },
  );

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasMore = page < totalPages;

  // ── Accumulate rows when a new page arrives ──
  // We use data.page (echoed by the API) rather than local `page` state
  // so this is safe even if SWR delivers a stale response.
  useEffect(() => {
    if (!data?.rows?.length) return;
    if (lastAppendedPageRef.current === data.page) return; // already appended
    lastAppendedPageRef.current = data.page;

    if (data.page === 1) {
      // First page or reset — replace everything
      setAccumulatedRows(data.rows);
    } else {
      // Subsequent pages — append, deduplicating by id as a safety net
      setAccumulatedRows((prev) => {
        const existingIds = new Set(prev.map(getRowId));
        const fresh = data.rows.filter((r) => !existingIds.has(getRowId(r)));
        return [...prev, ...fresh];
      });
    }
  }, [data, getRowId]);

  // ── IntersectionObserver: trigger next-page load when sentinel enters view ──
  // Paused while groupBy is active (grouping keeps classic pagination).
  useEffect(() => {
    if (groupBy) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading && hasMore) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isLoading, hasMore, groupBy]);

  // ── Column lookup ──
  const columnMap = useMemo(
    () => new Map(columns.map((c) => [c.key, c])),
    [columns],
  );
  const getColumnByKey = useCallback(
    (key: string) => columnMap.get(key),
    [columnMap],
  );

  const selectedColumnType = getColumnByKey(newFilterField)?.type;

  // ── Handlers ──

  const handleHeaderDoubleClick = useCallback(
    (key: string) => {
      setSortConfig((prev) => ({
        key,
        direction:
          prev.key === key && prev.direction === "asc" ? "desc" : "asc",
      }));
      resetPagination();
    },
    [resetPagination],
  );

  const handleAddFilter = useCallback(() => {
    if (!newFilterField || !newFilterValue) return;
    const col = columnMap.get(newFilterField);
    const finalValue = normalizeDateValue(newFilterValue, col?.type);
    setFilterConditions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        field: newFilterField,
        operator: newFilterOperator,
        value: finalValue,
      },
    ]);
    setNewFilterField("");
    setNewFilterOperator("contains");
    setNewFilterValue("");
    resetPagination();
  }, [
    newFilterField,
    newFilterValue,
    newFilterOperator,
    columnMap,
    resetPagination,
  ]);

  const handleRemoveFilter = useCallback(
    (id: string) => {
      setFilterConditions((prev) => prev.filter((fc) => fc.id !== id));
      resetPagination();
    },
    [resetPagination],
  );

  const handleClearFilters = useCallback(() => {
    setFilterConditions([]);
    resetPagination();
  }, [resetPagination]);

  const toggleFilterPanel = useCallback(
    () => setShowFilterPanel((v) => !v),
    [],
  );

  const handleFilterFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const key = e.target.value;
      setNewFilterField(key);
      const col = columnMap.get(key);
      if (col) {
        setNewFilterOperator(getOperatorsByType(col.type)[0]);
        setNewFilterValue("");
      }
    },
    [columnMap],
  );

  const handleFilterValueKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleAddFilter();
    },
    [handleAddFilter],
  );

  // ── Grouping ──
  // When groupBy is active: use current SWR page rows (classic pagination, no accumulation).
  // When groupBy is null:   use accumulatedRows (infinite scroll).
  const rowsForGrouping = data?.rows ?? [];

  const groupedData = useMemo(() => {
    if (!groupBy) return { null: accumulatedRows } as Record<string, T[]>;

    const col = columnMap.get(groupBy);
    if (!col) return { null: rowsForGrouping } as Record<string, T[]>;

    return rowsForGrouping.reduce<Record<string, T[]>>((groups, row) => {
      let val = col.accessor(row);
      if ((col.type === "date" || col.type === "datetime") && val) {
        const d = new Date(String(val));
        if (!isNaN(d.getTime())) val = format(d, col.groupFormat || "yyyy-MM");
      }
      const key = String(val ?? "Sin valor");
      (groups[key] ??= []).push(row);
      return groups;
    }, {});
  }, [accumulatedRows, rowsForGrouping, groupBy, columnMap]);

  const toggleGroupBy = useCallback(
    (key: string) => {
      if (groupBy === key) {
        // Deactivate grouping → re-enable infinite scroll from page 1
        setGroupBy(null);
        setCollapsedGroups({});
        resetPagination();
        return;
      }
      // Activate grouping → stay on page 1, stop accumulating
      setGroupBy(key);
      setPage(1);
      setAccumulatedRows([]);
      lastAppendedPageRef.current = 0;

      const col = columnMap.get(key);
      if (!col) return;
      const groups = rowsForGrouping.reduce<Record<string, boolean>>(
        (acc, row) => {
          let val = col.accessor(row);
          if ((col.type === "date" || col.type === "datetime") && val) {
            const d = new Date(String(val));
            if (!isNaN(d.getTime()))
              val = format(d, col.groupFormat || "yyyy-MM");
          }
          acc[String(val ?? "Sin valor")] = true;
          return acc;
        },
        {},
      );
      setCollapsedGroups(groups);
    },
    [groupBy, columnMap, rowsForGrouping, resetPagination],
  );

  const toggleGroupCollapse = useCallback(
    (group: string) =>
      setCollapsedGroups((prev) => ({ ...prev, [group]: !prev[group] })),
    [],
  );

  // ── Selection ──

  const allVisibleIds = useMemo(
    () =>
      Object.entries(groupedData)
        .filter(([group]) => !collapsedGroups[group])
        .flatMap(([, rws]) => rws.map(getRowId)),
    [groupedData, collapsedGroups, getRowId],
  );

  const handleRowSelect = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id),
    );
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds((prev) => {
          const hidden = prev.filter((id) => !allVisibleIds.includes(id));
          return [...hidden, ...allVisibleIds];
        });
      } else {
        setSelectedIds((prev) =>
          prev.filter((id) => !allVisibleIds.includes(id)),
        );
      }
    },
    [allVisibleIds],
  );

  const allVisibleSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedIds.includes(id));

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="position-relative">
      {/* Top-right spinner only on first-page load */}
      {isLoading && page === 1 && (
        <div
          className="position-absolute end-0 top-0 me-2 mt-2 d-flex align-items-center gap-2 text-muted"
          style={{ zIndex: 5 }}
        >
          <Spinner size="sm" />
          <span className="small">Cargando…</span>
        </div>
      )}

      {error && <div className="text-danger small mb-2">{error.message}</div>}

      {/* Filter panel */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={toggleFilterPanel}
          >
            <i
              className={`bi ${showFilterPanel ? "bi-eye-slash" : "bi-funnel"}`}
            />{" "}
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
              <i className="bi bi-trash" /> Limpiar filtros
            </Button>
          )}
        </div>

        {showFilterPanel && (
          <div className="border rounded p-2">
            {filterConditions.length > 0 && (
              <div className="mb-3">
                <strong>Filtros activos:</strong>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {filterConditions.map((filter) => {
                    const col = columnMap.get(filter.field);
                    return (
                      <FilterBadge
                        key={filter.id}
                        filter={filter}
                        label={col?.label ?? filter.field}
                        type={col?.type}
                        onRemove={handleRemoveFilter}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <div className="row g-2 align-items-end">
              <div className="col-auto">
                <Form.Label className="small mb-0">Campo</Form.Label>
                <Form.Select
                  size="sm"
                  value={newFilterField}
                  onChange={handleFilterFieldChange}
                  style={{ width: 220 }}
                >
                  <option value="">Seleccionar campo</option>
                  {visibleColumns.map((col) => {
                    const fa = accesProps.find(
                      (acc) => acc.fieldName === col.fieldName,
                    );
                    if (fa?.invisible) return null;
                    return (
                      <option key={col.key} value={col.key}>
                        {col.label}
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
                  style={{ width: 140 }}
                  disabled={!newFilterField}
                >
                  {getOperatorsByType(selectedColumnType).map((op) => (
                    <option key={op} value={op}>
                      {OPERATOR_LABELS[op]}
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
                    onKeyDown={handleFilterValueKeyDown}
                    style={{ width: 180 }}
                    disabled={!newFilterField}
                  />
                ) : selectedColumnType === "datetime" ? (
                  <Form.Control
                    size="sm"
                    type="datetime-local"
                    value={newFilterValue}
                    onChange={(e) => setNewFilterValue(e.target.value)}
                    onKeyDown={handleFilterValueKeyDown}
                    style={{ width: 220 }}
                    disabled={!newFilterField}
                  />
                ) : selectedColumnType === "boolean" ? (
                  <Form.Select
                    size="sm"
                    value={newFilterValue}
                    onChange={(e) => setNewFilterValue(e.target.value)}
                    style={{ width: 180 }}
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
                    onKeyDown={handleFilterValueKeyDown}
                    style={{ width: 250 }}
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
                  <i className="bi bi-plus-lg" /> Agregar filtro
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
                checked={allVisibleSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </th>

            {visibleColumns.map((col) => {
              const fa = accesProps.find(
                (acc) => acc.fieldName === col.fieldName,
              );
              if (fa?.invisible) return null;
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
                          />
                        ) : (
                          <i
                            className="bi bi-arrow-bar-down"
                            style={{ fontSize: "0.8rem" }}
                          />
                        ))}
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {Object.entries(groupedData).map(([group, groupRows]) => {
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
                      {columnMap.get(groupBy)?.label}: {group} (
                      {groupRows.length}){" "}
                      <i
                        className={`bi ${isCollapsed ? "bi-caret-down-fill" : "bi-caret-up-fill"}`}
                      />
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
                          const fa = accesProps.find(
                            (acc) => acc.fieldName === col.fieldName,
                          );
                          if (fa?.invisible) return null;
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

          {/*
            Sentinel row — sits invisibly at the bottom of the list.
            IntersectionObserver watches it to trigger next-page fetch.
            Hidden when groupBy is active (classic pagination takes over).
          */}
          {!groupBy && (
            <tr ref={sentinelRef} style={{ height: 1 }} aria-hidden>
              <td
                colSpan={visibleColumns.length + 1}
                style={{ padding: 0, border: 0 }}
              />
            </tr>
          )}
        </tbody>

        <tfoot className="sticky-bottom">
          {/* Bottom spinner while loading page 2+ */}
          {!groupBy && isLoading && page > 1 && (
            <tr>
              <td colSpan={visibleColumns.length + 1}>
                <div className="d-flex justify-content-center align-items-center gap-2 py-2 text-muted">
                  <Spinner size="sm" />
                  <span className="small">Cargando más registros…</span>
                </div>
              </td>
            </tr>
          )}

          {/* Record count summary */}
          {total > 0 && (
            <tr>
              <td colSpan={visibleColumns.length + 1}>
                <div className="d-flex justify-content-end py-1">
                  <span className="text-muted small">
                    {groupBy
                      ? `${total} registros en total`
                      : `${accumulatedRows.length} de ${total} registros`}
                  </span>
                </div>
              </td>
            </tr>
          )}

          {/* Classic pagination — only when groupBy is active */}
          {groupBy && total >= pageSize && (
            <tr>
              <td colSpan={visibleColumns.length + 1}>
                <div className="d-flex justify-content-end align-items-center gap-2">
                  <span className="text-muted small">
                    Página {page} de {totalPages}
                  </span>
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      disabled={page === 1 || isLoading}
                      onClick={() => {
                        setPage((p) => Math.max(1, p - 1));
                        lastAppendedPageRef.current = 0;
                      }}
                    >
                      <i className="bi bi-rewind-fill" />
                    </Button>
                    <Button
                      size="sm"
                      disabled={page === totalPages || isLoading}
                      onClick={() => {
                        setPage((p) => Math.min(totalPages, p + 1));
                        lastAppendedPageRef.current = 0;
                      }}
                    >
                      <i className="bi bi-fast-forward-fill" />
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
