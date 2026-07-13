// components/FilterBuilder.tsx
import { ColumnConfig, FilterValue } from "@/app/libs/definitions";
import { toDateOnly, toDateTimeLocal } from "@/app/libs/validatorDate";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button, Form, Badge, Modal, Dropdown } from "react-bootstrap";

interface FilterBuilderProps {
  columns: ColumnConfig[];
  filters?: FilterValue[];
  onChange: (filters: FilterValue[]) => void;
  storageKey?: string; // Clave para localStorage
}

// 🔥 Nuevo: Estructura para filtros guardados
interface SavedFilter {
  id: string;
  name: string;
  filters: FilterValue[];
  createdAt: string;
  updatedAt: string;
}

// 🔥 Nuevo: Clave separada para filtros guardados
const SAVED_FILTERS_KEY = "saved-filters";

export function FilterBuilder({
  columns,
  filters: externalFilters,
  onChange,
  storageKey = "filter-builder-state",
}: FilterBuilderProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [newField, setNewField] = useState("");
  const [newOperator, setNewOperator] = useState("contains");
  const [newValue, setNewValue] = useState<any>("");
  const [multiValueInput, setMultiValueInput] = useState("");
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");

  // 🔥 Nuevo: Estado para filtros guardados
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState("");
  const [selectedSavedFilter, setSelectedSavedFilter] = useState<string | null>(
    null,
  );

  // Estado interno para los filtros
  const [internalFilters, setInternalFilters] = useState<FilterValue[]>([]);

  // Usar filtros externos o internos
  const filters =
    externalFilters !== undefined ? externalFilters : internalFilters;

  // Ref para saber si es la primera carga
  const initialLoadRef = useRef(true);

  // 🔥 Cargar filtros guardados
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_FILTERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSavedFilters(parsed);
        }
      }
    } catch (error) {
      console.error("Error loading saved filters:", error);
    }
  }, []);

  // 🔥 Cargar filtro activo
  useEffect(() => {
    if (!initialLoadRef.current) return;
    initialLoadRef.current = false;

    try {
      // Intentar cargar filtro activo
      const activeKey = `${storageKey}-active`;
      const activeId = localStorage.getItem(activeKey);

      if (activeId) {
        const saved = localStorage.getItem(SAVED_FILTERS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const activeFilter = parsed.find(
            (f: SavedFilter) => f.id === activeId,
          );
          if (activeFilter && activeFilter.filters.length > 0) {
            setSelectedSavedFilter(activeId);
            if (externalFilters === undefined) {
              setInternalFilters(activeFilter.filters);
            } else {
              onChange(activeFilter.filters);
            }
            return;
          }
        }
      }

      // Si no hay filtro activo, cargar filtros normales
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedFilters = JSON.parse(saved);
        if (Array.isArray(parsedFilters) && parsedFilters.length > 0) {
          if (externalFilters === undefined) {
            setInternalFilters(parsedFilters);
          } else {
            onChange(parsedFilters);
          }
        }
      }
    } catch (error) {
      console.error("Error loading active filter:", error);
    }
  }, []);

  const updateSavedFilter = useCallback(
    (id: string, newFilters: FilterValue[]) => {
      const updated = savedFilters.map((sf) => {
        if (sf.id === id) {
          return {
            ...sf,
            filters: JSON.parse(JSON.stringify(newFilters)),
            updatedAt: new Date().toISOString(),
          };
        }
        return sf;
      });
      setSavedFilters(updated);
      localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
    },
    [savedFilters],
  ); // 👈 Agregar dependencia

  // Guardar filtros activos en localStorage
  useEffect(() => {
    try {
      if (filters.length > 0) {
        // Guardar filtros actuales como "activos"
        localStorage.setItem(storageKey, JSON.stringify(filters));

        // Si hay un filtro guardado seleccionado, actualizarlo
        if (selectedSavedFilter) {
          updateSavedFilter(selectedSavedFilter, filters);
        }
      } else {
        localStorage.removeItem(storageKey);
        if (selectedSavedFilter) {
          localStorage.removeItem(`${storageKey}-active`);
          setSelectedSavedFilter(null);
        }
      }
    } catch (error) {
      console.error("Error saving filters:", error);
    }
  }, [filters, storageKey]);

  const selectedColumn = columns.find((c) => c.field === newField);
  const columnType = selectedColumn?.type || "string";
  const operators = getOperatorsForType(columnType);
  const isMultiValueOperator = newOperator === "in" || newOperator === "notIn";
  const isRangeOperator = newOperator === "between";

  const updateFilters = (newFilters: FilterValue[]) => {
    if (externalFilters !== undefined) {
      onChange(newFilters);
    } else {
      setInternalFilters(newFilters);
    }
  };

  // 🔥 Guardar filtro con nombre
  const handleSaveFilter = () => {
    if (!saveFilterName.trim() || filters.length === 0) return;

    const newSavedFilter: SavedFilter = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name: saveFilterName.trim(),
      filters: JSON.parse(JSON.stringify(filters)), // Deep clone
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...savedFilters, newSavedFilter];
    setSavedFilters(updated);
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));

    // Seleccionar automáticamente el filtro guardado
    setSelectedSavedFilter(newSavedFilter.id);
    localStorage.setItem(`${storageKey}-active`, newSavedFilter.id);

    setShowSaveModal(false);
    setSaveFilterName("");
  };

  // 🔥 Actualizar filtro guardado

  // 🔥 Cargar filtro guardado
  const handleLoadFilter = (id: string) => {
    const savedFilter = savedFilters.find((sf) => sf.id === id);
    if (!savedFilter) return;

    setSelectedSavedFilter(id);
    localStorage.setItem(`${storageKey}-active`, id);

    // Cargar los filtros
    if (externalFilters !== undefined) {
      onChange(savedFilter.filters);
    } else {
      setInternalFilters(savedFilter.filters);
    }
  };

  // 🔥 Eliminar filtro guardado
  const handleDeleteFilter = (id: string) => {
    const updated = savedFilters.filter((sf) => sf.id !== id);
    setSavedFilters(updated);
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));

    if (selectedSavedFilter === id) {
      setSelectedSavedFilter(null);
      localStorage.removeItem(`${storageKey}-active`);
      // Limpiar filtros actuales
      updateFilters([]);
    }
  };

  // 🔥 Renombrar filtro guardado
  const handleRenameFilter = (id: string, newName: string) => {
    if (!newName.trim()) return;

    const updated = savedFilters.map((sf) => {
      if (sf.id === id) {
        return {
          ...sf,
          name: newName.trim(),
          updatedAt: new Date().toISOString(),
        };
      }
      return sf;
    });
    setSavedFilters(updated);
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
  };

  const handleAdd = () => {
    if (!newField) return;

    let typedValue: any = newValue;

    if (isRangeOperator) {
      if (!rangeFrom || !rangeTo) return;
      if (rangeFrom > rangeTo) {
        alert("La fecha inicial debe ser menor o igual a la fecha final");
        return;
      }
      typedValue = {
        gte: convertValue(rangeFrom, columnType),
        lte: convertValue(rangeTo, columnType),
      };
    } else if (isMultiValueOperator) {
      if (!multiValueInput.trim()) return;
      typedValue = multiValueInput
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v);
      if (typedValue.length === 0) return;
    } else {
      if (!newValue && newValue !== 0 && newValue !== false) return;
      typedValue = convertValue(newValue, columnType);
    }

    updateFilters([
      ...filters,
      {
        field: newField,
        operator: newOperator,
        value: typedValue,
      },
    ]);

    setNewField("");
    setNewOperator("contains");
    setNewValue("");
    setMultiValueInput("");
    setRangeFrom("");
    setRangeTo("");
  };

  const handleRemove = (index: number) => {
    updateFilters(filters.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    updateFilters([]);
    if (selectedSavedFilter) {
      localStorage.removeItem(`${storageKey}-active`);
      setSelectedSavedFilter(null);
    }
  };

  const handleOperatorChange = (operator: string) => {
    setNewOperator(operator);
    setNewValue("");
    setMultiValueInput("");
    setRangeFrom("");
    setRangeTo("");
  };

  const renderValueInput = () => {
    if (isRangeOperator) {
      const inputType = columnType === "datetime" ? "datetime-local" : "date";
      return (
        <div className="d-flex align-items-center gap-2">
          <Form.Control
            size="sm"
            type={inputType}
            placeholder="Desde"
            value={rangeFrom}
            onChange={(e) => setRangeFrom(e.target.value)}
            disabled={!newField}
            style={{ width: 180 }}
          />
          <span className="text-muted">a</span>
          <Form.Control
            size="sm"
            type={inputType}
            placeholder="Hasta"
            value={rangeTo}
            onChange={(e) => setRangeTo(e.target.value)}
            disabled={!newField}
            style={{ width: 180 }}
          />
        </div>
      );
    }

    if (isMultiValueOperator) {
      return (
        <Form.Control
          size="sm"
          type="text"
          placeholder="valor1, valor2, valor3"
          value={multiValueInput}
          onChange={(e) => setMultiValueInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          disabled={!newField}
          style={{ width: 300 }}
        />
      );
    }

    switch (columnType) {
      case "date":
        return (
          <Form.Control
            size="sm"
            type="date"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            disabled={!newField}
            style={{ width: 200 }}
          />
        );
      case "datetime":
        return (
          <Form.Control
            size="sm"
            type="datetime-local"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            disabled={!newField}
            style={{ width: 220 }}
          />
        );
      case "boolean":
        return (
          <Form.Select
            size="sm"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            disabled={!newField}
            style={{ width: 120 }}
          >
            <option value="">Seleccionar...</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </Form.Select>
        );
      case "number":
        return (
          <Form.Control
            size="sm"
            type="number"
            placeholder="Valor numérico..."
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            disabled={!newField}
            style={{ width: 180 }}
          />
        );
      default:
        return (
          <Form.Control
            size="sm"
            type="text"
            placeholder="Valor..."
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            disabled={!newField}
            style={{ width: 250 }}
          />
        );
    }
  };

  const isAddDisabled = () => {
    if (!newField) return true;
    if (isRangeOperator) return !rangeFrom || !rangeTo;
    if (isMultiValueOperator) return !multiValueInput.trim();
    return !newValue && newValue !== 0 && newValue !== false;
  };

  // 🔥 Obtener el nombre del filtro activo
  const getActiveFilterName = () => {
    if (!selectedSavedFilter) return null;
    const found = savedFilters.find((sf) => sf.id === selectedSavedFilter);
    return found?.name || null;
  };

  const activeFilterName = getActiveFilterName();

  return (
    <div className="mb-3">
      <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
        <Button
          size="sm"
          variant="outline-secondary"
          onClick={() => setShowPanel(!showPanel)}
        >
          <i className="bi bi-funnel me-1" />
          Filtros
          {filters.length > 0 && (
            <Badge bg="primary" className="ms-2">
              {filters.length}
            </Badge>
          )}
        </Button>

        {/* 🔥 Botón para guardar filtro */}
        {filters.length > 0 && (
          <Button
            size="sm"
            variant="outline-success"
            onClick={() => setShowSaveModal(true)}
          >
            <i className="bi bi-bookmark-plus me-1" />
            Guardar filtro
          </Button>
        )}

        {/* 🔥 Dropdown de filtros guardados */}
        {savedFilters.length > 0 && (
          <Dropdown className="d-inline-block">
            <Dropdown.Toggle
              size="sm"
              variant={activeFilterName ? "primary" : "outline-primary"}
            >
              <i className="bi bi-bookmarks me-1" />
              {activeFilterName || "Mis filtros"}
              {activeFilterName && (
                <Badge bg="light" text="primary" className="ms-1">
                  activo
                </Badge>
              )}
            </Dropdown.Toggle>

            <Dropdown.Menu style={{ minWidth: "250px" }}>
              {savedFilters.map((sf) => (
                <Dropdown.Item key={sf.id} className="p-0">
                  <div className="d-flex align-items-center justify-content-between px-2 py-1">
                    <span
                      className={`flex-grow-1 ${selectedSavedFilter === sf.id ? "fw-bold text-primary" : ""}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleLoadFilter(sf.id)}
                    >
                      {sf.name}
                      <small className="text-muted ms-2">
                        ({sf.filters.length} filtros)
                      </small>
                      {selectedSavedFilter === sf.id && (
                        <i className="bi bi-check-circle-fill text-primary ms-1" />
                      )}
                    </span>
                    <div className="d-flex gap-1">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        className="p-0 px-1"
                        style={{ fontSize: "0.7rem" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const newName = prompt("Nuevo nombre:", sf.name);
                          if (newName) handleRenameFilter(sf.id, newName);
                        }}
                      >
                        <i className="bi bi-pencil" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        className="p-0 px-1"
                        style={{ fontSize: "0.7rem" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`¿Eliminar el filtro "${sf.name}"?`)) {
                            handleDeleteFilter(sf.id);
                          }
                        }}
                      >
                        <i className="bi bi-x" />
                      </Button>
                    </div>
                  </div>
                </Dropdown.Item>
              ))}
              {activeFilterName && (
                <>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    className="text-danger"
                    onClick={() => {
                      handleClearAll();
                      localStorage.removeItem(`${storageKey}-active`);
                      setSelectedSavedFilter(null);
                    }}
                  >
                    <i className="bi bi-x-circle me-2" />
                    Desactivar filtro
                  </Dropdown.Item>
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        )}

        {filters.length > 0 && (
          <Button size="sm" variant="outline-danger" onClick={handleClearAll}>
            <i className="bi bi-trash" /> Limpiar
          </Button>
        )}
      </div>

      {/* 🔥 Indicador de filtro activo guardado */}
      {activeFilterName && (
        <div className="mb-2">
          <small className="text-success">
            <i className="bi bi-check-circle-fill me-1" />
            Filtro activo: <strong>{activeFilterName}</strong>
          </small>
        </div>
      )}

      {/* Filtros activos */}
      {filters.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-2">
          {filters.map((filter, index) => {
            const col = columns.find((c) => c.field === filter.field);
            return (
              <Badge
                key={index}
                bg="primary"
                className="d-flex align-items-center gap-2 p-2"
              >
                <span>
                  {col?.label || filter.field}: {operatorLabel(filter.operator)}{" "}
                  {formatFilterValue(filter.value, col?.type)}
                </span>
                <i
                  className="bi bi-x-circle-fill"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRemove(index)}
                />
              </Badge>
            );
          })}
        </div>
      )}

      {/* Panel de nuevo filtro */}
      {showPanel && (
        <div className="border rounded p-3">
          <div className="row g-2 align-items-end">
            <div className="col-auto">
              <Form.Label className="small mb-1">Campo</Form.Label>
              <Form.Select
                size="sm"
                value={newField}
                onChange={(e) => {
                  setNewField(e.target.value);
                  const col = columns.find((c) => c.field === e.target.value);
                  if (col) {
                    const defaultOp = getOperatorsForType(col.type)[0];
                    setNewOperator(defaultOp);
                  }
                  setNewValue("");
                  setMultiValueInput("");
                  setRangeFrom("");
                  setRangeTo("");
                }}
                style={{ width: 200 }}
              >
                <option value="">Seleccionar...</option>
                {columns
                  .filter((col) => col.filterable !== false)
                  .map((col) => (
                    <option key={col.field} value={col.field}>
                      {col.label}
                    </option>
                  ))}
              </Form.Select>
            </div>

            <div className="col-auto">
              <Form.Label className="small mb-1">Operador</Form.Label>
              <Form.Select
                size="sm"
                value={newOperator}
                onChange={(e) => handleOperatorChange(e.target.value)}
                disabled={!newField}
                style={{ width: 150 }}
              >
                {operators.map((op) => (
                  <option key={op} value={op}>
                    {operatorLabel(op)}
                  </option>
                ))}
              </Form.Select>
            </div>

            <div className="col-auto">
              <Form.Label className="small mb-1">
                {isRangeOperator
                  ? "Rango"
                  : isMultiValueOperator
                    ? "Valores (separados por coma)"
                    : "Valor"}
              </Form.Label>
              {renderValueInput()}
            </div>

            <div className="col-auto">
              <Button
                size="sm"
                variant="primary"
                onClick={handleAdd}
                disabled={isAddDisabled()}
              >
                <i className="bi bi-plus-lg" />
              </Button>
            </div>
          </div>

          {isMultiValueOperator && (
            <div className="mt-2">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1" />
                Ingresa múltiples valores separados por coma. Ejemplo: Activo,
                Pendiente, Completado o 1, 2, 3
              </small>
            </div>
          )}

          {isRangeOperator && (
            <div className="mt-2">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1" />
                Selecciona la fecha inicial y final del rango. La fecha inicial
                debe ser menor o igual a la fecha final.
              </small>
            </div>
          )}
        </div>
      )}

      {/* 🔥 Modal para guardar filtro */}
      <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-bookmark-plus me-2" />
            Guardar filtro
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nombre del filtro</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Pedidos de enero 2024"
              value={saveFilterName}
              onChange={(e) => setSaveFilterName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveFilter()}
              autoFocus
            />
            <Form.Text className="text-muted">
              {filters.length} filtro{filters.length !== 1 ? "s" : ""}{" "}
              configurado{filters.length !== 1 ? "s" : ""}
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveFilter}
            disabled={!saveFilterName.trim()}
          >
            <i className="bi bi-save me-1" />
            Guardar filtro
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// Helpers para tipos y operadores
function getOperatorsForType(type?: string): string[] {
  switch (type) {
    case "date":
    case "datetime":
      // 🆕 Agregar "between" para fechas
      return ["=", "!=", ">", ">=", "<", "<=", "between", "in", "notIn"];
    case "number":
      return ["=", "!=", ">", ">=", "<", "<=", "in", "notIn"];
    case "boolean":
      return ["=", "!="];
    case "relation":
      return ["=", "!=", "contains", "in", "notIn"];
    default:
      return ["=", "!=", "contains", "startsWith", "endsWith", "in", "notIn"];
  }
}

function operatorLabel(op: string): string {
  const labels: Record<string, string> = {
    "=": "=",
    "!=": "≠",
    contains: "contiene",
    startsWith: "empieza con",
    endsWith: "termina con",
    ">": ">",
    ">=": "≥",
    "<": "<",
    "<=": "≤",
    in: "está en",
    notIn: "no está en",
    between: "entre", // 🆕
    some: "contiene",
    every: "todos",
    none: "ninguno",
  };
  return labels[op] || op;
}

function convertValue(value: string, type?: string): any {
  if (!value && value !== "0") return value;

  switch (type) {
    case "number":
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    case "boolean":
      return value === "true";
    case "date":
      return value;
    case "datetime":
      return value;
    default:
      return value;
  }
}

// 🆕 Actualizado para manejar el formato "between"
// Actualizar formatFilterValue
function formatFilterValue(value: any, type?: string): string {
  if (value == null) return "";

  // 🔥 Manejar objeto de rango (between) - ahora con gte/lte
  if (
    typeof value === "object" &&
    value !== null &&
    ("gte" in value || "lte" in value)
  ) {
    const from = value.gte ? formatSingleValue(value.gte, type) : "...";
    const to = value.lte ? formatSingleValue(value.lte, type) : "...";
    return `${from} - ${to}`;
  }

  // Si es array (para operadores in/notIn)
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    if (value.length <= 3) {
      return value.map((v) => formatSingleValue(v, type)).join(", ");
    }
    return `${value
      .slice(0, 3)
      .map((v) => formatSingleValue(v, type))
      .join(", ")}... (${value.length} valores)`;
  }

  return formatSingleValue(value, type);
}

// 🆕 Helper para formatear un valor individual
function formatSingleValue(value: any, type?: string): string {
  if (value == null) return "";

  if (type === "boolean") {
    return value ? "Sí" : "No";
  }

  if (type === "datetime" && value) {
    try {
      return toDateTimeLocal(value);
    } catch {
      return String(value);
    }
  }

  if (type === "date" && value) {
    try {
      return toDateOnly(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}
