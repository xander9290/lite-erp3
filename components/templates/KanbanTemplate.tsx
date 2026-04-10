// components/KanbanTemplate.tsx
"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { Form, Button, Spinner, Badge } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/sessionStore";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

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
import LoadingPage from "@/app/loading-page";

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
  sortGroups?: (groups: string[]) => string[];
  onDragEnd?: (
    itemId: string,
    newGroup: string,
    oldGroup: string,
    newIndex: number,
  ) => Promise<void>;
  enableDragDrop?: boolean;
  useInfiniteScroll?: boolean;
  infiniteScrollThreshold?: number;
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

function DraggableCard<T>({
  row,
  getRowId,
  renderCard,
  onCardClick,
  disabled = false,
}: {
  row: T;
  getRowId: (row: T) => string;
  renderCard: (row: T) => React.ReactNode;
  onCardClick?: (row: T) => void;
  disabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: getRowId(row),
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: disabled ? "pointer" : "grab",
    width: "100%",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(disabled ? {} : attributes)}
      {...(disabled ? {} : listeners)}
      onClick={() => onCardClick?.(row)}
      className="kanban-card"
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
  sortGroups,
  onDragEnd,
  enableDragDrop = true,
  useInfiniteScroll = false,
  infiniteScrollThreshold = 200,
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

  const [activeId, setActiveId] = useState<string | null>(null);
  const [localGroupedData, setLocalGroupedData] = useState<Record<
    string,
    T[]
  > | null>(null);
  const [isDraggingPersist, setIsDraggingPersist] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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

  const buildBaseUrl = useCallback(
    (pageNum: number) => {
      const params = new URLSearchParams();
      params.set("page", String(pageNum));
      params.set("pageSize", String(pageSize));
      params.set("fields", fieldsParam);
      if (sortConfig.key) {
        params.set("sortKey", sortConfig.key);
        params.set("sortDir", sortConfig.direction);
      }
      params.set("domain", serializedDomain);
      params.set("includes", JSON.stringify(includes ?? {}));
      return `/api/tables/${model}?${params.toString()}`;
    },
    [model, pageSize, fieldsParam, sortConfig, serializedDomain, includes],
  );

  // 🔧 CORRECCIÓN: Definir getKey para useSWRInfinite
  const getKey = useCallback(
    (pageIndex: number, previousPageData: KanbanApiResponse<T> | null) => {
      // Si no estamos en modo infinite scroll, no generar key
      if (!useInfiniteScroll) return null;
      // Si es la primera página o hay más datos
      if (previousPageData && !previousPageData.rows.length) return null;
      // Si no hay más páginas
      if (previousPageData && previousPageData.rows.length < pageSize)
        return null;
      // Construir URL para la página (página 1 = index 0)
      return buildBaseUrl(pageIndex + 1);
    },
    [useInfiniteScroll, pageSize, buildBaseUrl],
  );

  // 🔧 CORRECCIÓN: Siempre llamar a useSWRInfinite, pero getKey puede retornar null
  const {
    data: infiniteData,
    error: infiniteError,
    isLoading: infiniteIsLoading,
    isValidating,
    setSize: setPageCount,
    mutate: infiniteMutate,
  } = useSWRInfinite<KanbanApiResponse<T>>(getKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateFirstPage: false,
    parallel: false,
  });

  // Paginación tradicional con useSWR (solo cuando no es infinite scroll)
  const {
    data: paginatedData,
    error: paginatedError,
    isLoading: paginatedIsLoading,
    mutate: paginatedMutate,
  } = useSWR<KanbanApiResponse<T>>(
    !useInfiniteScroll ? buildBaseUrl(page) : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    },
  );

  // Determinar qué datos usar según el modo
  const isLoading = useInfiniteScroll ? infiniteIsLoading : paginatedIsLoading;
  const error = useInfiniteScroll ? infiniteError : paginatedError;
  const mutate = useInfiniteScroll ? infiniteMutate : paginatedMutate;

  // Obtener todas las filas (para infinite scroll)
  const allRows = useMemo(() => {
    if (!useInfiniteScroll) return paginatedData?.rows ?? [];
    if (!infiniteData) return [];
    return infiniteData.flatMap((page) => page.rows);
  }, [useInfiniteScroll, infiniteData, paginatedData]);

  const total = useInfiniteScroll
    ? (infiniteData?.[0]?.total ?? 0)
    : (paginatedData?.total ?? 0);

  const hasMore = useInfiniteScroll
    ? infiniteData && allRows.length < total
    : page < Math.max(1, Math.ceil(total / pageSize));

  const rows = allRows;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Resetear páginas cuando cambian filtros o orden
  useEffect(() => {
    if (useInfiniteScroll) {
      setPageCount(1);
    } else {
      setPage(1);
    }
  }, [serializedDomain, sortConfig, useInfiniteScroll, setPageCount]);

  // Configurar Intersection Observer para scroll infinito
  useEffect(() => {
    if (!useInfiniteScroll || !hasMore || infiniteIsLoading || isValidating)
      return;

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (
        target.isIntersecting &&
        hasMore &&
        !infiniteIsLoading &&
        !isValidating
      ) {
        setPageCount((prev) => prev + 1);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      root: containerRef.current,
      rootMargin: `0px 0px ${infiniteScrollThreshold}px 0px`,
      threshold: 0,
    });

    const currentElement = loadMoreRef.current;
    if (currentElement) {
      observerRef.current.observe(currentElement);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [
    useInfiniteScroll,
    hasMore,
    infiniteIsLoading,
    isValidating,
    setPageCount,
    infiniteScrollThreshold,
  ]);

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
    if (!useInfiniteScroll) {
      setPage(1);
    } else {
      setPageCount(1);
    }
  };

  const handleRemoveFilter = (id: string) => {
    setFilterConditions(filterConditions.filter((fc) => fc.id !== id));
    if (!useInfiniteScroll) {
      setPage(1);
    } else {
      setPageCount(1);
    }
  };

  const handleClearFilters = () => {
    setFilterConditions([]);
    if (!useInfiniteScroll) {
      setPage(1);
    } else {
      setPageCount(1);
    }
  };

  // Agrupar datos
  const groupedDataRaw = useMemo(() => {
    const col = columns.find((c) => c.key === groupBy);
    if (!col) return { "Sin categoría": rows };

    const groups = rows.reduce<Record<string, T[]>>((groups, row) => {
      const value = col.accessor(row);
      const key = String(value ?? "Sin categoría");
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
      return groups;
    }, {});

    const groupKeys = Object.keys(groups);
    const sortedKeys = sortGroups
      ? sortGroups(groupKeys)
      : groupKeys.sort((a, b) => {
          if (a === "Sin categoría") return 1;
          if (b === "Sin categoría") return -1;
          return a.localeCompare(b);
        });

    const orderedGroups: Record<string, T[]> = {};
    sortedKeys.forEach((key) => {
      orderedGroups[key] = groups[key];
    });

    return orderedGroups;
  }, [rows, groupBy, columns, sortGroups]);

  const groupedData = localGroupedData ?? groupedDataRaw;

  useEffect(() => {
    if (!isDraggingPersist) {
      setLocalGroupedData(null);
    }
  }, [groupedDataRaw, isDraggingPersist]);

  const toggleGroupCollapse = (group: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const getColumnByKey = (key: string) => {
    return columns.find((c) => c.key === key);
  };

  const selectedColumnType = getColumnByKey(newFilterField)?.type;

  const handleCardClickInternal = (row: T) => {
    if (onCardClick) {
      onCardClick(row);
      return;
    }
    if (viewForm) {
      const id = getRowId(row);
      router.push(`${viewForm}&id=${id}`);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setIsDraggingPersist(false);

    if (!over) return;

    const activeIdStr = active.id as string;
    const overId = over.id as string;

    let sourceGroup: string | null = null;
    let targetGroup: string | null = null;
    let sourceIndex = -1;
    let targetIndex = -1;
    let draggedItem: T | null = null;

    for (const [group, items] of Object.entries(groupedData)) {
      const index = items.findIndex((item) => getRowId(item) === activeIdStr);
      if (index !== -1) {
        sourceGroup = group;
        sourceIndex = index;
        draggedItem = items[index];
        break;
      }
    }

    if (!sourceGroup || !draggedItem) return;

    if (overId !== sourceGroup) {
      for (const [group, items] of Object.entries(groupedData)) {
        const index = items.findIndex((item) => getRowId(item) === overId);
        if (index !== -1) {
          targetGroup = group;
          targetIndex = index;
          break;
        }
      }
    } else {
      targetGroup = sourceGroup;
      targetIndex = sourceIndex;
    }

    if (!targetGroup) return;
    if (sourceGroup === targetGroup && sourceIndex === targetIndex) return;

    if (sourceGroup === targetGroup) {
      const newItems = arrayMove(
        groupedData[targetGroup],
        sourceIndex,
        targetIndex,
      );
      setLocalGroupedData({
        ...groupedData,
        [targetGroup]: newItems,
      });

      if (onDragEnd) {
        await onDragEnd(activeIdStr, targetGroup, sourceGroup, targetIndex);
      }
      return;
    }

    const col = columns.find((c) => c.key === groupBy);
    if (col) {
      const newSourceItems = [...groupedData[sourceGroup]];
      newSourceItems.splice(sourceIndex, 1);

      const newTargetItems = [...groupedData[targetGroup]];
      newTargetItems.splice(targetIndex, 0, draggedItem);

      const newGroupedData = {
        ...groupedData,
        [sourceGroup]: newSourceItems,
        [targetGroup]: newTargetItems,
      };

      if (newSourceItems.length === 0) {
        delete newGroupedData[sourceGroup];
      }

      setLocalGroupedData(newGroupedData);

      if (onDragEnd) {
        await onDragEnd(activeIdStr, targetGroup, sourceGroup, targetIndex);
      }

      mutate();
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setIsDraggingPersist(false);
    setLocalGroupedData(null);
  };

  const activeItem = useMemo(() => {
    if (!activeId) return null;
    for (const items of Object.values(groupedData)) {
      const item = items.find((row) => getRowId(row) === activeId);
      if (item) return item;
    }
    return null;
  }, [activeId, groupedData, getRowId]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="position-relative">
        {isLoading && <LoadingPage />}

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
                            {col?.label || filter.field}:
                            {operatorLabels[filter.operator]} {displayValue}
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
            ref={containerRef}
            style={{
              display: "flex",
              gap: "1rem",
              overflowX: "auto",
              overflowY: useInfiniteScroll ? "auto" : "hidden",
              padding: "0.5rem 0.5rem 1rem 0.5rem",
              minHeight: "500px",
              maxWidth: "100vw",
              ...(useInfiniteScroll && {
                maxHeight: "calc(100vh - 200px)",
              }),
            }}
          >
            {Object.entries(groupedData).map(([group, items]) => {
              const isCollapsed = collapsedGroups[group] ?? false;
              return (
                <div
                  key={group}
                  style={{
                    width: "320px",
                    flexShrink: 0,
                    borderRadius: "8px",
                    padding: "0.75rem",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <div
                    style={{
                      padding: "0.5rem",
                      borderBottom: "2px solid #dee2e6",
                      marginBottom: "0.75rem",
                      cursor: "pointer",
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                    }}
                    onClick={() => toggleGroupCollapse(group)}
                  >
                    <h6 className="mb-0 d-flex justify-content-between align-items-center">
                      <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                        {group}{" "}
                        <Badge bg="secondary" style={{ fontSize: "0.7rem" }}>
                          {items.length}
                        </Badge>
                      </span>
                      <i
                        className={`bi ${isCollapsed ? "bi-chevron-down" : "bi-chevron-up"}`}
                        style={{ fontSize: "0.8rem" }}
                      ></i>
                    </h6>
                  </div>
                  {!isCollapsed && (
                    <SortableContext
                      items={items.map((item) => getRowId(item))}
                      strategy={verticalListSortingStrategy}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.75rem",
                          maxHeight: useInfiniteScroll
                            ? "none"
                            : "calc(100vh - 250px)",
                          overflowY: useInfiniteScroll ? "visible" : "auto",
                          paddingRight: "6px",
                          minHeight: "200px",
                        }}
                      >
                        {items.map((row) =>
                          enableDragDrop ? (
                            <DraggableCard
                              key={getRowId(row)}
                              row={row}
                              getRowId={getRowId}
                              renderCard={renderCard}
                              onCardClick={handleCardClickInternal}
                            />
                          ) : (
                            <div
                              key={getRowId(row)}
                              onClick={() => handleCardClickInternal(row)}
                              style={{ cursor: "pointer", width: "100%" }}
                            >
                              {renderCard(row)}
                            </div>
                          ),
                        )}
                      </div>
                    </SortableContext>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Loader para scroll infinito */}
        {useInfiniteScroll && hasMore && (
          <div ref={loadMoreRef} className="d-flex justify-content-center py-3">
            {(infiniteIsLoading || isValidating) && (
              <div className="d-flex align-items-center gap-2 text-muted">
                <Spinner size="sm" />
                <span className="small">Cargando más elementos…</span>
              </div>
            )}
          </div>
        )}

        {/* Contador de registros */}
        {total > 0 && (
          <div className="mt-3 text-end">
            <small className="text-muted">
              Mostrando {rows.length} de {total} registros
            </small>
          </div>
        )}

        {/* Paginación tradicional */}
        {!useInfiniteScroll && total >= pageSize && (
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

      <DragOverlay>
        {activeItem ? (
          <div style={{ cursor: "grabbing", opacity: 0.8 }}>
            {renderCard(activeItem)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Scroll infinito
{
  /* <KanbanTemplate
  model="tasks"
  columns={columns}
  getRowId={(task) => task.id}
  groupBy="status"
  renderCard={(task) => <TaskCard task={task} />}
  useInfiniteScroll={true}
  pageSize={15}
/>

// Paginación tradicional (default)
<KanbanTemplate
  model="tasks"
  columns={columns}
  getRowId={(task) => task.id}
  groupBy="status"
  renderCard={(task) => <TaskCard task={task} />}
  useInfiniteScroll={false}
/> */
}
