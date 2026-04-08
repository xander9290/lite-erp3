// components/KanbanTemplate.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Form, Button, Spinner, Badge } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/sessionStore";
import useSWR from "swr";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type KanbanTemplateColumn<T> = {
  key: string;
  fieldName?: string;
  label: string;
  type?: "string" | "number" | "date" | "datetime" | "boolean";
  accessor: (row: T) => unknown;
  render?: (row: T, index: number) => React.ReactNode;
};

type KanbanApiResponse<T> = {
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

type KanbanTemplateProps<T> = {
  model: string;
  columns: KanbanTemplateColumn<T>[];
  getRowId: (row: T) => string;
  groupBy: string;
  renderCard: (row: T) => React.ReactNode;
  onCardClick?: (row: T) => void;
  viewForm?: string;
  pageSize?: number;
  defaultOrder?: string;
  domain?: Domain;
  includes?: any;
  emptyMessage?: string;
  // 🆕 Función para ordenar los grupos (personalizable)
  sortGroups?: (groups: string[]) => string[];
  onDragEnd?: (
    itemId: string,
    newGroup: string,
    oldGroup: string,
    newIndex: number,
  ) => Promise<void>; // 🆕 Callback para persistir el cambio
  enableDragDrop?: boolean; // 🆕 Para habilitar/deshabilitar drag & drop
};

const fetcher = async <T,>(url: string): Promise<KanbanApiResponse<T>> => {
  const res = await fetch(url);
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json();
};

function parseDefaultOrder(defaultOrder?: string): {
  key: string | null;
  direction: "asc" | "desc";
} {
  if (!defaultOrder?.trim()) {
    return { key: null, direction: "asc" };
  }
  const parts = defaultOrder.trim().split(/\s+/);
  return {
    key: parts[0] ?? null,
    direction: (parts[1] ?? "asc").toLowerCase() === "desc" ? "desc" : "asc",
  };
}

const getOperatorsByType = (type?: string): DomainOperator[] => {
  switch (type) {
    case "number":
    case "date":
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
  return value;
};

// Componente para cada tarjeta (draggable)
function DraggableCard<T>({
  row,
  getRowId,
  renderCard,
  onCardClick,
}: {
  row: T;
  getRowId: (row: T) => string;
  renderCard: (row: T) => React.ReactNode;
  onCardClick?: (row: T) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: getRowId(row) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onCardClick?.(row)}
    >
      {renderCard(row)}
    </div>
  );
}

export default function KanbanTemplate<T>({
  model,
  columns,
  getRowId,
  groupBy,
  renderCard,
  onCardClick,
  viewForm,
  pageSize: pageSizeProp = 20,
  defaultOrder,
  domain: externalDomain,
  includes,
  emptyMessage = "No hay elementos para mostrar",
  sortGroups, // 🆕 Recibir la función de ordenamiento
}: KanbanTemplateProps<T>) {
  const router = useRouter();
  const { access } = useAuth();
  const modelName = viewForm?.split("?")[0].split("/")[2];
  const accesProps = access.filter((acc) => acc.entityType === modelName);

  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>(
    [],
  );
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [newFilterField, setNewFilterField] = useState<string>("");
  const [newFilterOperator, setNewFilterOperator] =
    useState<DomainOperator>("contains");
  const [newFilterValue, setNewFilterValue] = useState<string>("");

  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "asc" | "desc";
  }>(() => parseDefaultOrder(defaultOrder));

  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
  const [page, setPage] = useState(1);
  const pageSize = pageSizeProp;

  useEffect(() => {
    setSortConfig(parseDefaultOrder(defaultOrder));
    setPage(1);
  }, [defaultOrder]);

  useEffect(() => {
    setPage(1);
  }, [JSON.stringify(externalDomain)]);

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

  const { data, error, isLoading } = useSWR<KanbanApiResponse<T>>(
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

  const handleAddFilter = () => {
    if (!newFilterField || !newFilterValue) return;

    let finalValue = newFilterValue;
    const columnType = getColumnByKey(newFilterField)?.type;

    if (columnType === "date" || columnType === "datetime") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(newFilterValue)) {
        finalValue = `${newFilterValue}T00:00:00.000Z`;
      } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(newFilterValue)) {
        finalValue = `${newFilterValue}:00.000Z`;
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

  // 🔥 Agrupar y ordenar datos con función personalizada
  const groupedData = useMemo(() => {
    const col = columns.find((c) => c.key === groupBy);
    if (!col) return { "Sin categoría": rows };

    // 1. Agrupar los datos
    const groups = rows.reduce<Record<string, T[]>>((groups, row) => {
      let value = col.accessor(row);
      const key = String(value ?? "Sin categoría");
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
      return groups;
    }, {});

    // 2. Obtener las claves de los grupos
    const groupKeys = Object.keys(groups);

    // 3. Ordenar usando la función personalizada o el orden por defecto
    const sortedKeys = sortGroups
      ? sortGroups(groupKeys) // Usar función personalizada
      : groupKeys.sort((a, b) => {
          // Orden por defecto: "Sin categoría" al final
          if (a === "Sin categoría") return 1;
          if (b === "Sin categoría") return -1;
          return a.localeCompare(b);
        });

    // 4. Construir el objeto ordenado
    const orderedGroups: Record<string, T[]> = {};
    sortedKeys.forEach((key) => {
      orderedGroups[key] = groups[key];
    });

    return orderedGroups;
  }, [rows, groupBy, columns, sortGroups]);

  const toggleGroupCollapse = (group: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const getColumnByKey = (key: string) => {
    return columns.find((c) => c.key === key);
  };

  const selectedColumnType = getColumnByKey(newFilterField)?.type;

  const handleCardClick = (row: T) => {
    if (onCardClick) {
      onCardClick(row);
      return;
    }
    if (viewForm) {
      const id = getRowId(row);
      router.push(`${viewForm}&id=${id}`);
    }
  };

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
                          {operatorLabels[filter.operator]} "{displayValue}"
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
                  {columns.map((col) => {
                    const fieldAccess = accesProps.find(
                      (acc) => acc.fieldName === col.fieldName,
                    );
                    if (fieldAccess?.invisible) return null;
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

      {/* Vista Kanban */}
      {rows.length === 0 && !isLoading ? (
        <div className="text-center p-5 text-muted">{emptyMessage}</div>
      ) : (
        <div
          style={{
            display: "flex",
            gap: "1rem",
            overflowX: "auto",
            padding: "0.5rem",
            minHeight: "500px",
          }}
        >
          {Object.entries(groupedData).map(([group, items]) => {
            const isCollapsed = collapsedGroups[group] ?? false;
            return (
              <div
                key={group}
                style={{
                  minWidth: "320px",
                  maxWidth: "380px",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    padding: "0.5rem",
                    borderBottom: "2px solid #dee2e6",
                    marginBottom: "0.75rem",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleGroupCollapse(group)}
                >
                  <h6 className="mb-0 d-flex justify-content-between align-items-center">
                    <span>
                      {group} <Badge bg="secondary">{items.length}</Badge>
                    </span>
                    <i
                      className={`bi ${isCollapsed ? "bi-chevron-down" : "bi-chevron-up"}`}
                    ></i>
                  </h6>
                </div>
                {!isCollapsed && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      maxHeight: "calc(100vh - 250px)",
                      overflowY: "auto",
                      paddingRight: "4px",
                    }}
                  >
                    {items.map((row) => (
                      <div
                        key={getRowId(row)}
                        onClick={() => handleCardClick(row)}
                        style={{ cursor: "pointer" }}
                      >
                        {renderCard(row)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {total >= pageSize && (
        <div className="mt-4 d-flex justify-content-end align-items-center gap-2">
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <i className="bi bi-fast-forward-fill"></i>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
