"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Table, Form, Button, Spinner } from "react-bootstrap";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
// import { useAccess } from "@/context/AccessContext";

export type TableTemplateColumn<T> = {
  key: string;
  label: string;
  type?: "string" | "number" | "date" | "boolean";
  filterable?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accessor: (row: T) => any;
  render?: (row: T, index: number) => React.ReactNode;
  groupFormat?: string;
};

type TableApiResponse<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
};

type TableProps<T> = {
  model: string; // 👈 nuevo
  columns: TableTemplateColumn<T>[];
  getRowId: (row: T) => string | number;
  onSelectionChange?: (ids: Array<string | number>) => void;
  viewForm?: string;

  pageSize?: number; // opcional
};

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

export default function TableTemplate<T>({
  model,
  columns,
  getRowId,
  onSelectionChange,
  viewForm,
  pageSize: pageSizeProp,
}: TableProps<T>) {
  const router = useRouter();
  //   const access = useAccess();

  const [filters, setFilters] = useState<Record<string, string>>({});
  const debouncedFilters = useDebouncedValue(filters, 350);

  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const [groupBy, setGroupBy] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  const [page, setPage] = useState(1);
  const pageSize = pageSizeProp ?? 20;

  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Notificar cambios de selección
  useEffect(() => {
    onSelectionChange?.(selectedIds);
  }, [selectedIds, onSelectionChange]);

  const visibleColumns = useMemo(() => {
    return columns.filter((col) => {
      //   const fieldAccess = access?.find((f) => f.fieldName === col.key);
      //   return !fieldAccess?.invisible;
    });
  }, [columns]);

  // fields que pedimos al API: claves visibles + id (por si no viene)
  const fieldsParam = useMemo(() => {
    const keys = new Set<string>();

    // incluye todas las columnas (con relaciones tipo "company.name" también)
    for (const c of columns) keys.add(c.key);

    // asegura id
    keys.add("id");

    return Array.from(keys).join(",");
  }, [columns]);

  const buildUrl = useMemo(() => {
    const url = new URL(`/api/tables/${model}`, window.location.origin);

    console.log(url);

    url.searchParams.set("page", String(page));
    url.searchParams.set("pageSize", String(pageSize));
    url.searchParams.set("fields", fieldsParam);

    if (sortConfig.key) {
      url.searchParams.set("sortKey", sortConfig.key);
      url.searchParams.set("sortDir", sortConfig.direction);
    }

    // mandamos todos los filtros (aunque haya columnas no visibles, no pasa nada)
    url.searchParams.set("filters", JSON.stringify(debouncedFilters));

    return url.toString();
  }, [
    model,
    page,
    pageSize,
    fieldsParam,
    sortConfig.key,
    sortConfig.direction,
    debouncedFilters,
  ]);

  // Fetch server-side
  useEffect(() => {
    setLoading(true);
    setError(null);

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    fetch(buildUrl, { signal: ac.signal })
      .then(async (res) => {
        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(msg || `HTTP ${res.status}`);
        }
        return res.json() as Promise<TableApiResponse<T>>;
      })
      .then((json) => {
        setRows(json.rows ?? []);
        setTotal(json.total ?? 0);
      })
      .catch((e) => {
        if (e?.name === "AbortError") return;
        setError(e?.message ?? "Error loading table");
        setRows([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [buildUrl]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleHeaderDoubleClick = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
    setPage(1);
  };

  // Grouping (client-side sobre la página actual; si quieres grouping global real, hay que hacerlo en server)
  const groupedData = useMemo(() => {
    if (!groupBy) return { null: rows };

    const col = columns.find((c) => c.key === groupBy);
    if (!col) return { null: rows };

    return rows.reduce<Record<string, T[]>>((groups, row) => {
      let val = col.accessor(row);

      if (col.type === "date" && val) {
        const d = new Date(val);
        if (!isNaN(d.getTime())) val = format(d, col.groupFormat || "yyyy-MM");
      }

      const key = val ?? "Sin valor";
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
      return groups;
    }, {});
  }, [rows, groupBy, columns]);

  const paginatedData = useMemo(() => {
    // ya viene paginado del server. Si está agrupado, devolvemos el grouping de la página.
    return groupedData;
  }, [groupedData]);

  const toggleGroupBy = (key: string) => {
    if (groupBy === key) {
      setGroupBy(null);
      setCollapsedGroups({});
    } else {
      setGroupBy(key);

      // inicializa los grupos como colapsados=true (igual que tu lógica original)
      const col = columns.find((c) => c.key === key);
      if (!col) return;

      const groups = rows.reduce<Record<string, boolean>>((acc, row) => {
        let val = col.accessor(row);
        if (col.type === "date" && val) {
          const d = new Date(val);
          if (!isNaN(d.getTime()))
            val = format(d, col.groupFormat || "yyyy-MM");
        }
        acc[val ?? "Sin valor"] = true;
        return acc;
      }, {});
      setCollapsedGroups(groups);
    }
  };

  const toggleGroupCollapse = (group: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const handleRowSelect = (id: string | number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id),
    );
  };

  // Selección “todo” solo filas visibles (en pantalla) y no colapsadas
  const allVisibleIds = Object.entries(paginatedData)
    .filter(([group]) => !(collapsedGroups[group] ?? false))
    .flatMap(([_, rws]) => rws.map(getRowId));

  const handleSelectAll = (checked: boolean) => {
    const visibleIds = allVisibleIds;

    if (checked) {
      const hiddenIds = selectedIds.filter((id) => !visibleIds.includes(id));
      setSelectedIds([...hiddenIds, ...visibleIds]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    }
  };

  return (
    <div className="position-relative">
      {loading && (
        <div
          className="position-absolute end-0 top-0 me-2 mt-2 d-flex align-items-center gap-2 text-muted"
          style={{ zIndex: 5 }}
        >
          <Spinner size="sm" />
          <span className="small">Cargando…</span>
        </div>
      )}

      {error && <div className="text-danger small mb-2">{error}</div>}

      <Table borderless hover style={{ fontSize: "0.9rem" }}>
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

            {columns.map((col) => {
              //   const fieldAccess = access?.find(
              //     (field) => field.fieldName === col.key,
              //   );
              //   if (fieldAccess?.invisible) return null;

              return (
                <th
                  key={col.key}
                  style={{ minWidth: 140 }}
                  onDoubleClick={() => handleHeaderDoubleClick(col.key)}
                  className="border-end border-bottom table-active text-nowrap"
                >
                  <div
                    style={{ fontSize: "1rem" }}
                    className="d-flex align-items-center gap-1 p-0"
                  >
                    {col.filterable ? (
                      <Form.Control
                        size="sm"
                        type="text"
                        placeholder={col.label}
                        value={filters[col.key] ?? ""}
                        onChange={(e) =>
                          handleFilterChange(col.key, e.target.value)
                        }
                        className="fw-bolder"
                        title={col.key}
                      />
                    ) : (
                      <span title={col.key}>{col.label}</span>
                    )}

                    <i
                      className={`bi bi-collection ${groupBy === col.key ? "text-warning" : "text-muted"}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleGroupBy(col.key)}
                      title={`Agrupar por ${col.label}`}
                    />

                    {sortConfig.key === col.key &&
                      (sortConfig.direction === "asc" ? (
                        <i className="bi bi-arrow-bar-up"></i>
                      ) : (
                        <i className="bi bi-arrow-bar-down"></i>
                      ))}
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
                    <td colSpan={columns.length + 1} valign="middle">
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

                        {columns.map((col, index) => {
                          //   const fieldAccess = access?.find(
                          //     (field) => field.fieldName === col.key,
                          //   );
                          //   if (fieldAccess?.invisible) return null;

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
          <tr style={{ display: total >= pageSize ? "table-row" : "none" }}>
            <td colSpan={columns.length + 1}>
              {!groupBy && (
                <div className="d-flex justify-content-end align-items-center gap-2 sticky-top">
                  <span className="text-muted small">
                    Página {page} de {totalPages} — {total} registros
                  </span>
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      disabled={page === 1 || loading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <i className="bi bi-rewind-fill"></i>
                    </Button>
                    <Button
                      size="sm"
                      disabled={page === totalPages || loading}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      <i className="bi bi-fast-forward-fill"></i>
                    </Button>
                  </div>
                </div>
              )}
            </td>
          </tr>
        </tfoot>
      </Table>
    </div>
  );
}
