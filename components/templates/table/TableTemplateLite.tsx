// components/templates/table/TableTemplateLite.tsx
import React, { useState } from "react"; // 👈 Ya no importa useCallback/useMemo
import { Table, Form, Spinner } from "react-bootstrap";
import useSWR from "swr";
import { FilterBuilder } from "./FilterBuilder";
import { SortIndicator } from "./SortIndicator";
import { GroupByControl } from "./GroupByControl";
import { Pagination } from "./Pagination";
import { ColumnConfig, FilterValue, TableData } from "@/app/libs/definitions";

interface TableTemplateProps {
  model: string;
  children: React.ReactNode;
  pageSize?: number;
  defaultOrder?: string;
  onRowClick?: (row: any) => void;
  baseDomain?: any[];
  showSelection?: boolean;
  onSelectionChange?: (ids: string[]) => void;
}

function buildSortForApi(field: string, dir: "asc" | "desc"): any {
  if (!field.includes(".")) {
    return { [field]: dir };
  }
  const [relation, ...path] = field.split(".");
  return { [relation]: { [path.join(".")]: dir } };
}

export function TableTemplateLite({
  model,
  children,
  pageSize = 20,
  defaultOrder,
  onRowClick,
  baseDomain = [],
  showSelection = true,
  onSelectionChange,
}: TableTemplateProps) {
  // Extraer columnas
  const columns: ColumnConfig[] = React.Children.toArray(children)
    .filter((child) => React.isValidElement(child))
    .map((child) => child.props as ColumnConfig);

  // Estado
  const [sort, setSort] = useState<{ field: string; dir: "asc" | "desc" }>(
    () => {
      if (defaultOrder) {
        const [field, dir] = defaultOrder.split(" ");
        return {
          field,
          dir: dir?.toLowerCase() === "desc" ? "desc" : "asc",
        };
      }
      return { field: "id", dir: "asc" };
    },
  );

  const [filters, setFilters] = useState<FilterValue[]>([]);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<string | null>(null);

  // Columnas visibles
  const visibleColumns = columns.filter(
    (col) => col.sortable !== false || col.field !== "id",
  );

  // Construir URL de API
  const sortForApi = buildSortForApi(sort.field, sort.dir);
  const includes = columns.reduce((acc, col) => {
    if (col.include) Object.assign(acc, col.include);
    return acc;
  }, {});

  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sort: JSON.stringify(sortForApi),
    filters: JSON.stringify(filters),
    domain: JSON.stringify(baseDomain),
    columnTypes: JSON.stringify(
      Object.fromEntries(
        columns.map((col) => [col.field, col.type || "string"]),
      ),
    ),
    includes: JSON.stringify(includes),
  });

  const apiUrl = `/api/tables/${model}?${params}`;

  // SWR fetch
  const { data, error, isLoading } = useSWR<TableData>(apiUrl, fetcher);

  // Datos agrupados
  const groupedData: Record<string, any[]> | null = (() => {
    if (!groupBy || !data?.rows) return null;

    const col = columns.find((c) => c.field === groupBy);
    if (!col) return null;

    return data.rows.reduce(
      (groups: Record<string, any[]>, row: any) => {
        const value = getNestedValue(row, groupBy);
        const key = formatGroupKey(value, col.type);
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
        return groups;
      },
      {} as Record<string, any[]>,
    );
  })();

  // Handlers
  const handleSort = (field: string) => {
    setSort((prev) => ({
      field,
      dir: prev.field === field && prev.dir === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

  const handleFilter = (newFilters: FilterValue[]) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
    onSelectionChange?.(ids);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!data?.rows) return;
    const newIds = checked
      ? [...new Set([...selectedIds, ...data.rows.map((r: any) => r.id)])]
      : selectedIds.filter((id) => !data.rows.some((r: any) => r.id === id));
    handleSelectionChange(newIds);
  };

  const handleRowSelect = (id: string, checked: boolean) => {
    const newIds = checked
      ? [...selectedIds, id]
      : selectedIds.filter((x) => x !== id);
    handleSelectionChange(newIds);
  };

  const isAllSelected =
    data &&
    data?.rows?.length > 0 &&
    data.rows.every((r: any) => selectedIds.includes(r.id));

  // Render rows
  const renderRow = (row: any, index: number) => (
    <tr
      key={row.id || index}
      onClick={() => onRowClick?.(row)}
      style={{ cursor: onRowClick ? "pointer" : "default" }}
    >
      {showSelection && (
        <td
          onClick={(e) => e.stopPropagation()}
          className="text-center border-bottom"
          valign="middle"
        >
          <Form.Check
            type="checkbox"
            checked={selectedIds.includes(row.id) || false}
            onChange={(e) => handleRowSelect(row.id, e.target.checked)}
          />
        </td>
      )}
      {visibleColumns.map((col) => {
        if (col.render) {
          return (
            <td key={col.field} className="border-bottom" valign="middle">
              {col.render(getNestedValue(row, col.field), row, index)}
            </td>
          );
        }
        return (
          <td key={col.field} className="border-bottom" valign="middle">
            {formatCellValue(
              getNestedValue(row, col.field),
              col.type,
              col.format,
            )}
          </td>
        );
      })}
    </tr>
  );

  const renderRows = () => {
    if (groupedData) {
      return Object.entries(groupedData).map(([group, rows]) => (
        <React.Fragment key={group}>
          <tr>
            <td
              colSpan={visibleColumns.length + (showSelection ? 1 : 0)}
              className="border-bottom"
              valign="middle"
            >
              <strong>
                <i className="bi bi-collection me-2" />
                {group} ({rows.length})
              </strong>
            </td>
          </tr>
          {rows.map((row: any, index: number) => renderRow(row, index))}
        </React.Fragment>
      ));
    }
    return data?.rows?.map((row: any, index: number) => renderRow(row, index));
  };

  return (
    <div className="position-relative">
      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex gap-2">
          <FilterBuilder
            columns={columns}
            filters={filters}
            onChange={handleFilter}
          />
          <GroupByControl
            columns={columns}
            currentGroup={groupBy}
            onGroupChange={setGroupBy}
          />
        </div>
        {isLoading && (
          <Spinner size="sm" animation="border" variant="primary" />
        )}
      </div>

      {/* Table */}
      <Table borderless hover size="sm" style={{ fontSize: "0.9rem" }}>
        <thead className="sticky-top" style={{ zIndex: 1 }}>
          <tr>
            {showSelection && (
              <th
                style={{ width: 40 }}
                className="text-center border-end border-bottom table-active"
              >
                <Form.Check
                  type="checkbox"
                  checked={isAllSelected || false}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
            )}
            {visibleColumns.map((col) => {
              return (
                <th
                  key={col.field}
                  onClick={() =>
                    col.sortable !== false && handleSort(col.field)
                  }
                  style={{
                    cursor: col.sortable !== false ? "pointer" : "default",
                    userSelect: "none",
                  }}
                  className="text-center border-end border-bottom table-active"
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <span>{col.label}</span>
                    {col.sortable !== false && (
                      <SortIndicator
                        active={sort.field === col.field}
                        direction={sort.dir}
                      />
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data?.rows?.length ? (
            renderRows()
          ) : (
            <tr>
              <td
                colSpan={visibleColumns.length + (showSelection ? 1 : 0)}
                className="text-center py-4 text-muted"
              >
                {isLoading ? "Cargando..." : "No hay registros"}
              </td>
            </tr>
          )}
        </tbody>
        {data && data?.total > 0 && (
          <tfoot>
            <tr>
              <td colSpan={visibleColumns.length + (showSelection ? 1 : 0)}>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    {data?.total.toLocaleString()} registros
                    {selectedIds.length > 0 && (
                      <span className="ms-2 text-primary">
                        ({selectedIds.length} seleccionados)
                      </span>
                    )}
                  </small>
                  <Pagination
                    currentPage={page}
                    totalPages={Math.ceil(data?.total / pageSize)}
                    onPageChange={setPage}
                    isLoading={isLoading}
                  />
                </div>
              </td>
            </tr>
          </tfoot>
        )}
      </Table>

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2" />
          {error.message || "Error al cargar datos"}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

function formatCellValue(value: any, type?: string, format?: string): string {
  if (value == null) return "";
  if (type === "number" && format === "currency") {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(Number(value));
  }
  if ((type === "date" || type === "datetime") && value) {
    try {
      const date = new Date(value);
      return type === "date"
        ? date.toLocaleDateString("es-MX")
        : date.toLocaleString("es-MX");
    } catch {
      return String(value);
    }
  }
  if (type === "boolean") return value ? "Sí" : "No";
  return String(value);
}

function formatGroupKey(value: any, type?: string): string {
  if (value == null) return "Sin valor";
  if (type === "datetime" || type === "date") {
    try {
      const date = new Date(value);
      return date.toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
      });
    } catch {
      return String(value);
    }
  }
  return String(value);
}

async function fetcher(url: string): Promise<TableData> {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}
