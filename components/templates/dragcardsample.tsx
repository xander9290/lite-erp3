// components/KanbanTemplate.tsx (con Drag & Drop)
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Form, Button, Spinner, Badge } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/sessionStore";
import useSWR from "swr";

// Agrega estas importaciones
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

// ... (tus tipos existentes)

type KanbanTemplateProps<T> = {
  // ... tus props existentes
  onDragEnd?: (
    itemId: string,
    newGroup: string,
    oldGroup: string,
    newIndex: number,
  ) => Promise<void>; // 🆕 Callback para persistir el cambio
  enableDragDrop?: boolean; // 🆕 Para habilitar/deshabilitar drag & drop
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
  sortGroups,
  onDragEnd, // 🆕
  enableDragDrop = true, // 🆕
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

  // 🆕 Estado para drag & drop
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localGroupedData, setLocalGroupedData] = useState<Record<
    string,
    T[]
  > | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
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

  const { data, error, isLoading, mutate } = useSWR<CardApiResponse<T>>(
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

  // 🔥 Agrupar y ordenar datos con función personalizada
  const groupedDataRaw = useMemo(() => {
    const col = columns.find((c) => c.key === groupBy);
    if (!col) return { "Sin categoría": rows };

    const groups = rows.reduce<Record<string, T[]>>((groups, row) => {
      let value = col.accessor(row);
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

  // Usar datos locales durante el drag & drop
  const groupedData = localGroupedData ?? groupedDataRaw;

  // Resetear datos locales cuando cambian los datos originales
  useEffect(() => {
    setLocalGroupedData(null);
  }, [groupedDataRaw]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Encontrar el grupo de origen y destino
    let sourceGroup: string | null = null;
    let targetGroup: string | null = null;
    let sourceIndex = -1;
    let targetIndex = -1;
    let draggedItem: T | null = null;

    // Buscar el elemento arrastrado y su grupo
    for (const [group, items] of Object.entries(groupedData)) {
      const index = items.findIndex((item) => getRowId(item) === activeId);
      if (index !== -1) {
        sourceGroup = group;
        sourceIndex = index;
        draggedItem = items[index];
        break;
      }
    }

    // Si el drop es sobre una tarjeta, encontrar su grupo
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

    // Si es el mismo grupo y misma posición, no hacer nada
    if (sourceGroup === targetGroup && sourceIndex === targetIndex) return;

    // Si es dentro del mismo grupo, reordenar
    if (sourceGroup === targetGroup && targetGroup) {
      const newItems = arrayMove(
        groupedData[targetGroup],
        sourceIndex,
        targetIndex,
      );
      setLocalGroupedData({
        ...groupedData,
        [targetGroup]: newItems,
      });

      // Notificar cambio de orden (opcional)
      if (onDragEnd && draggedItem) {
        await onDragEnd(activeId, targetGroup, sourceGroup, targetIndex);
      }
      return;
    }

    // Si cambió de grupo
    if (sourceGroup && targetGroup && draggedItem) {
      // Crear una copia del elemento con el nuevo grupo
      const col = columns.find((c) => c.key === groupBy);
      if (col) {
        // Actualizar localmente
        const newSourceItems = [...groupedData[sourceGroup]];
        newSourceItems.splice(sourceIndex, 1);

        const newTargetItems = [...groupedData[targetGroup]];
        newTargetItems.splice(targetIndex, 0, draggedItem);

        setLocalGroupedData({
          ...groupedData,
          [sourceGroup]: newSourceItems,
          [targetGroup]: newTargetItems,
        });

        // Limpiar grupos vacíos
        if (newSourceItems.length === 0) {
          setLocalGroupedData((prev) => {
            const newState = { ...prev };
            delete newState[sourceGroup];
            return newState;
          });
        }

        // Llamar al callback para persistir en el backend
        if (onDragEnd) {
          await onDragEnd(activeId, targetGroup, sourceGroup, targetIndex);
        }

        // Refrescar datos del backend después del drag
        mutate();
      }
    }
  };

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

  // Encontrar el elemento activo para el DragOverlay
  const activeItem = useMemo(() => {
    if (!activeId) return null;
    for (const items of Object.values(groupedData)) {
      const item = items.find((row) => getRowId(row) === activeId);
      if (item) return item;
    }
    return null;
  }, [activeId, groupedData, getRowId]);

  // ... (el resto de tus funciones: handleAddFilter, handleRemoveFilter, etc. se mantienen igual)

  const getColumnByKey = (key: string) => columns.find((c) => c.key === key);
  const selectedColumnType = getColumnByKey(newFilterField)?.type;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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

        {/* Panel de filtros (igual que antes) */}
        {/* ... mantén todo el código del panel de filtros ... */}

        {/* Vista Kanban con Drag & Drop */}
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
                    background: "#f8f9fa",
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
                    <SortableContext
                      items={items.map((item) => getRowId(item))}
                      strategy={verticalListSortingStrategy}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.75rem",
                          maxHeight: "calc(100vh - 250px)",
                          overflowY: "auto",
                          paddingRight: "4px",
                          minHeight: "100px",
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
                              style={{ cursor: "pointer" }}
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

// EJEMPLO DE USO

// import KanbanTemplate from "@/components/KanbanTemplate";

// export default function TasksPage() {
//   const handleDragEnd = async (taskId: string, newStatus: string, oldStatus: string, newIndex: number) => {
//     // Llamar a tu API para actualizar el estado de la tarea
//     await fetch(`/api/tables/tasks/${taskId}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ status: newStatus }),
//     });

//     // Opcional: actualizar también el orden (índice)
//     console.log(`Tarea ${taskId} movida de ${oldStatus} a ${newStatus} en posición ${newIndex}`);
//   };

//   return (
//     <KanbanTemplate
//       model="tasks"
//       columns={TASK_COLUMNS}
//       getRowId={(task) => task.id}
//       groupBy="status"
//       renderCard={(task) => (
//         <Card className="shadow-sm">
//           <Card.Body>
//             <Card.Title className="h6">{task.title}</Card.Title>
//             <Card.Text className="small text-muted">{task.description}</Card.Text>
//             <Badge bg="secondary">{task.priority}</Badge>
//           </Card.Body>
//         </Card>
//       )}
//       onDragEnd={handleDragEnd}  // 🔥 Persistir el cambio
//       enableDragDrop={true}      // 🔥 Habilitar drag & drop
//       viewForm="/app/tasks?form"
//     />
//   );
// }
