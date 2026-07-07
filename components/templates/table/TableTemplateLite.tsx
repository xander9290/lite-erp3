// components/templates/table/TableTemplateLite.tsx
import React, { useState } from "react";
import { Table, Form, Spinner, Badge } from "react-bootstrap";
import useSWR from "swr";
import { FilterBuilder } from "./FilterBuilder";
import { SortIndicator } from "./SortIndicator";
import { GroupByControl } from "./GroupByControl";
import { Pagination } from "./Pagination";
import { ColumnConfig, FilterValue, TableData } from "@/app/libs/definitions";
import { extractEntityFromPath } from "@/contexts/AccessContext";
import { useAuth } from "@/hooks/sessionStore";
import { usePathname } from "next/navigation";
import styles from "./TableTemplateLite.module.css";

interface TableTemplateProps {
  model: string;
  children: React.ReactNode;
  pageSize?: number;
  defaultOrder?: string;
  onRowClick?: (row: any) => void;
  baseDomain?: any[];
  showSelection?: boolean;
  onSelectionChange?: (ids: string[]) => void;
  showTotals?: boolean;
  totalColumns?: string[];
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
  showTotals = false,
  totalColumns = [],
}: TableTemplateProps) {
  const { access, uid } = useAuth();

  const pathName = usePathname();
  const entity = extractEntityFromPath(pathName);
  const modelAccess = access.filter((acc) => acc.entityType === entity);

  const columns: ColumnConfig[] = React.Children.toArray(children)
    .filter((child) => React.isValidElement(child))
    .map((child) => child.props as ColumnConfig);

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

  const visibleColumns = columns.filter((col) => {
    const getAccess = modelAccess.find((acc) => acc.fieldName === col.field);
    if (getAccess && getAccess.invisible) return false;
    return col.sortable !== false || col.field !== "id";
  });

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

  const { data, error, isLoading } = useSWR<TableData>(apiUrl, fetcher);

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

  const calculateTotals = () => {
    if (!showTotals || !data?.rows?.length) return null;

    const rows = groupedData ? Object.values(groupedData).flat() : data.rows;

    const columnsToSum =
      totalColumns.length > 0
        ? totalColumns
        : visibleColumns
            .filter((col) => col.type === "number")
            .map((col) => col.field);

    const totals: Record<string, number> = {};

    columnsToSum.forEach((colField) => {
      const total = rows.reduce((sum, row) => {
        const value = getNestedValue(row, colField);
        const numValue = typeof value === "number" ? value : parseFloat(value);
        return sum + (isNaN(numValue) ? 0 : numValue);
      }, 0);

      totals[colField] = total;
    });

    return totals;
  };

  const totals = calculateTotals();

  const renderTotalsRow = () => {
    if (!totals) return null;

    return (
      <tr className={styles.totalRow}>
        {showSelection && (
          <td className={styles.totalLabelCell} valign="middle">
            <span>Total</span>
          </td>
        )}

        {visibleColumns.map((col) => {
          const totalValue = totals[col.field];
          const hasTotal = totalValue !== undefined;

          return (
            <td key={col.field} className={styles.totalCell} valign="middle">
              {hasTotal ? (
                <div className={styles.totalValue}>
                  {formatCellValue(totalValue, col.type, col.format)}
                </div>
              ) : (
                <span className="text-muted">—</span>
              )}
            </td>
          );
        })}
      </tr>
    );
  };

  const renderRow = (row: any, index: number) => (
    <tr
      key={row.id || index}
      onClick={() => onRowClick?.(row)}
      className={`${styles.tableRow} ${onRowClick ? styles.clickableRow : ""}`}
    >
      {showSelection && (
        <td
          onClick={(e) => e.stopPropagation()}
          className={styles.selectionCell}
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
        const value = getNestedValue(row, col.field);

        if (col.render) {
          return (
            <td key={col.field} className={styles.bodyCell} valign="middle">
              {col.render(value, row, index)}
            </td>
          );
        }

        return (
          <td
            key={col.field}
            className={`${styles.bodyCell} ${
              col.type === "number" ? styles.numericCell : ""
            }`}
            valign="middle"
          >
            {formatCellValue(value, col.type, col.format)}
          </td>
        );
      })}
    </tr>
  );

  const renderRows = () => {
    if (groupedData) {
      return Object.entries(groupedData).map(([group, rows]) => (
        <React.Fragment key={group}>
          <tr className={styles.groupRow}>
            <td
              colSpan={visibleColumns.length + (showSelection ? 1 : 0)}
              valign="middle"
            >
              <div className={styles.groupContent}>
                <div className={styles.groupTitle}>
                  <i className="bi bi-collection" />
                  <span>{group}</span>
                </div>

                <Badge bg="secondary" pill>
                  {rows.length}
                </Badge>
              </div>
            </td>
          </tr>

          {rows.map((row: any, index: number) => renderRow(row, index))}
        </React.Fragment>
      ));
    }

    return data?.rows?.map((row: any, index: number) => renderRow(row, index));
  };

  const from = data?.total && data.rows.length ? (page - 1) * pageSize + 1 : 0;

  const to =
    data?.total && data.rows.length ? Math.min(page * pageSize, data.total) : 0;

  return (
    <section className={styles.tableShell}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <FilterBuilder
            columns={columns}
            filters={filters}
            onChange={handleFilter}
            storageKey={`${uid}-filters-${entity}`}
          />

          <GroupByControl
            columns={columns}
            storageKey={`${uid}-groupby-${entity}`}
            onGroupChange={setGroupBy}
          />
        </div>

        <div className={styles.toolbarRight}>
          {selectedIds.length > 0 && (
            <Badge bg="primary" pill className={styles.selectedBadge}>
              {selectedIds.length} seleccionados
            </Badge>
          )}

          {isLoading && (
            <div className={styles.loadingState}>
              <Spinner size="sm" animation="border" variant="primary" />
              <span>Cargando</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.tableContainer}>
        <Table borderless hover size="sm" className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              {showSelection && (
                <th className={styles.selectionHead}>
                  <Form.Check
                    type="checkbox"
                    checked={isAllSelected || false}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}

              {visibleColumns.map((col) => (
                <th
                  key={col.field}
                  onClick={() =>
                    col.sortable !== false && handleSort(col.field)
                  }
                  title={col.field}
                  className={`${styles.headCell} ${
                    col.sortable !== false ? styles.sortableHeadCell : ""
                  }`}
                >
                  <div className={styles.headContent}>
                    <span>{col.label}</span>

                    {col.sortable !== false && (
                      <SortIndicator
                        active={sort.field === col.field}
                        direction={sort.dir}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data?.rows?.length ? (
              renderRows()
            ) : (
              <tr>
                <td
                  colSpan={visibleColumns.length + (showSelection ? 1 : 0)}
                  className={styles.emptyCell}
                >
                  <div className={styles.emptyState}>
                    <i className="bi bi-inbox" />
                    <strong>
                      {isLoading ? "Cargando..." : "No hay registros"}
                    </strong>
                    <span>
                      {isLoading
                        ? "Estamos preparando la información."
                        : "No se encontraron datos para mostrar."}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>

          {data && data?.total > 0 && (
            <tfoot className={styles.tableFoot}>
              {totals && renderTotalsRow()}

              <tr>
                <td colSpan={visibleColumns.length + (showSelection ? 1 : 0)}>
                  <div className={styles.footerContent}>
                    <div className={styles.footerInfo}>
                      <small>
                        Mostrando <strong>{from}</strong>–<strong>{to}</strong>{" "}
                        de <strong>{data.total.toLocaleString()}</strong>
                      </small>

                      {groupBy && (
                        <small className="text-muted">
                          Agrupado por <strong>{groupBy}</strong>
                        </small>
                      )}
                    </div>

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
      </div>

      {error && (
        <div className={styles.errorBox}>
          <i className="bi bi-exclamation-triangle" />
          <span>{error.message || "Error al cargar datos"}</span>
        </div>
      )}
    </section>
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
