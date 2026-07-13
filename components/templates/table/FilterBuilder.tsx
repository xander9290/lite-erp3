// // components/FilterBuilder.tsx
// import { ColumnConfig, FilterValue } from "@/app/libs/definitions";
// import { toDateOnly, toDateTimeLocal } from "@/app/libs/validatorDate";
// import { useState, useEffect } from "react";
// import { Button, Form, Badge } from "react-bootstrap";

// interface FilterBuilderProps {
//   columns: ColumnConfig[];
//   filters?: FilterValue[];
//   onChange: (filters: FilterValue[]) => void;
//   storageKey?: string; // Clave para localStorage
// }

// export function FilterBuilder({ columns, filters: externalFilters, onChange, storageKey = "filter-builder-state" }: FilterBuilderProps) {
//   const [showPanel, setShowPanel] = useState(false);
//   const [newField, setNewField] = useState("");
//   const [newOperator, setNewOperator] = useState("contains");
//   const [newValue, setNewValue] = useState<any>("");
//   const [multiValueInput, setMultiValueInput] = useState("");

//   // Estado interno para los filtros (si no se usan props externos)
//   const [internalFilters, setInternalFilters] = useState<FilterValue[]>([]);

//   // Usar filtros externos o internos
//   const filters = externalFilters !== undefined ? externalFilters : internalFilters;

//   // Cargar filtros guardados al iniciar
//   useEffect(() => {
//     try {
//       const saved = localStorage.getItem(storageKey);
//       if (saved) {
//         const parsedFilters = JSON.parse(saved);
//         if (Array.isArray(parsedFilters) && parsedFilters.length > 0) {
//           if (externalFilters === undefined) {
//             setInternalFilters(parsedFilters);
//           } else {
//             onChange(parsedFilters);
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error loading filters from localStorage:", error);
//     }
//   }, []); // Solo se ejecuta una vez al montar

//   // Guardar filtros en localStorage cuando cambien
//   useEffect(() => {
//     try {
//       if (filters.length > 0) {
//         localStorage.setItem(storageKey, JSON.stringify(filters));
//       } else {
//         // Limpiar localStorage si no hay filtros
//         localStorage.removeItem(storageKey);
//       }
//     } catch (error) {
//       console.error("Error saving filters to localStorage:", error);
//     }
//   }, [filters, storageKey]);

//   const selectedColumn = columns.find((c) => c.field === newField);
//   const columnType = selectedColumn?.type || "string";
//   const operators = getOperatorsForType(columnType);
//   const isMultiValueOperator = newOperator === "in" || newOperator === "notIn";

//   // Función para actualizar filtros
//   const updateFilters = (newFilters: FilterValue[]) => {
//     if (externalFilters !== undefined) {
//       onChange(newFilters);
//     } else {
//       setInternalFilters(newFilters);
//     }
//   };

//   const handleAdd = () => {
//     if (!newField) return;

//     let typedValue: any = newValue;

//     if (isMultiValueOperator) {
//       if (!multiValueInput.trim()) return;
//       typedValue = multiValueInput
//         .split(",")
//         .map((v) => v.trim())
//         .filter((v) => v);

//       if (typedValue.length === 0) return;
//     } else {
//       if (!newValue && newValue !== 0 && newValue !== false) return;
//       typedValue = convertValue(newValue, columnType);
//     }

//     updateFilters([
//       ...filters,
//       {
//         field: newField,
//         operator: newOperator,
//         value: typedValue,
//       },
//     ]);

//     // Resetear formulario
//     setNewField("");
//     setNewOperator("contains");
//     setNewValue("");
//     setMultiValueInput("");
//   };

//   const handleRemove = (index: number) => {
//     updateFilters(filters.filter((_, i) => i !== index));
//   };

//   const handleClearAll = () => {
//     updateFilters([]);
//   };

//   const handleOperatorChange = (operator: string) => {
//     setNewOperator(operator);
//     setNewValue("");
//     setMultiValueInput("");
//   };

//   return (
//     <div className="mb-3">
//       <div className="d-flex align-items-center gap-2 mb-2">
//         <Button size="sm" variant="outline-secondary" onClick={() => setShowPanel(!showPanel)}>
//           <i className="bi bi-funnel me-1" />
//           Filtros
//           {filters.length > 0 && (
//             <Badge bg="primary" className="ms-2">
//               {filters.length}
//             </Badge>
//           )}
//         </Button>

//         {filters.length > 0 && (
//           <Button size="sm" variant="outline-danger" onClick={handleClearAll}>
//             <i className="bi bi-trash" /> Limpiar
//           </Button>
//         )}
//       </div>

//       {/* Indicador de persistencia */}
//       {filters.length > 0 && (
//         <div className="mb-2">
//           <small className="text-muted">
//             <i className="bi bi-database-check me-1" />
//             Filtros guardados en el navegador
//           </small>
//         </div>
//       )}

//       {/* Filtros activos */}
//       {filters.length > 0 && (
//         <div className="d-flex flex-wrap gap-2 mb-2">
//           {filters.map((filter, index) => {
//             const col = columns.find((c) => c.field === filter.field);
//             return (
//               <Badge key={index} bg="primary" className="d-flex align-items-center gap-2 p-2">
//                 <span>
//                   {col?.label || filter.field}: {operatorLabel(filter.operator)} {formatFilterValue(filter.value, col?.type)}
//                 </span>
//                 <i className="bi bi-x-circle-fill" style={{ cursor: "pointer" }} onClick={() => handleRemove(index)} />
//               </Badge>
//             );
//           })}
//         </div>
//       )}

//       {/* Panel de nuevo filtro */}
//       {showPanel && (
//         <div className="border rounded p-3">
//           <div className="row g-2 align-items-end">
//             <div className="col-auto">
//               <Form.Label className="small mb-1">Campo</Form.Label>
//               <Form.Select
//                 size="sm"
//                 value={newField}
//                 onChange={(e) => {
//                   setNewField(e.target.value);
//                   const col = columns.find((c) => c.field === e.target.value);
//                   if (col) {
//                     const defaultOp = getOperatorsForType(col.type)[0];
//                     setNewOperator(defaultOp);
//                   }
//                   setNewValue("");
//                   setMultiValueInput("");
//                 }}
//                 style={{ width: 200 }}
//               >
//                 <option value="">Seleccionar...</option>
//                 {columns
//                   .filter((col) => col.filterable !== false)
//                   .map((col) => (
//                     <option key={col.field} value={col.field}>
//                       {col.label}
//                     </option>
//                   ))}
//               </Form.Select>
//             </div>

//             <div className="col-auto">
//               <Form.Label className="small mb-1">Operador</Form.Label>
//               <Form.Select size="sm" value={newOperator} onChange={(e) => handleOperatorChange(e.target.value)} disabled={!newField} style={{ width: 150 }}>
//                 {operators.map((op) => (
//                   <option key={op} value={op}>
//                     {operatorLabel(op)}
//                   </option>
//                 ))}
//               </Form.Select>
//             </div>

//             <div className="col-auto">
//               <Form.Label className="small mb-1">{isMultiValueOperator ? "Valores (separados por coma)" : "Valor"}</Form.Label>

//               {/* Para operadores in/notIn - entrada de múltiples valores */}
//               {isMultiValueOperator ? (
//                 <Form.Control
//                   size="sm"
//                   type="text"
//                   placeholder="valor1, valor2, valor3"
//                   value={multiValueInput}
//                   onChange={(e) => setMultiValueInput(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && handleAdd()}
//                   disabled={!newField}
//                   style={{ width: 300 }}
//                 />
//               ) : columnType === "date" ? (
//                 <Form.Control
//                   size="sm"
//                   type="date"
//                   value={newValue}
//                   onChange={(e) => setNewValue(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && handleAdd()}
//                   disabled={!newField}
//                   style={{ width: 200 }}
//                 />
//               ) : columnType === "datetime" ? (
//                 <Form.Control
//                   size="sm"
//                   type="datetime-local"
//                   value={newValue}
//                   onChange={(e) => setNewValue(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && handleAdd()}
//                   disabled={!newField}
//                   style={{ width: 220 }}
//                 />
//               ) : columnType === "boolean" ? (
//                 <Form.Select size="sm" value={newValue} onChange={(e) => setNewValue(e.target.value)} disabled={!newField} style={{ width: 120 }}>
//                   <option value="">Seleccionar...</option>
//                   <option value="true">Sí</option>
//                   <option value="false">No</option>
//                 </Form.Select>
//               ) : columnType === "number" ? (
//                 <Form.Control
//                   size="sm"
//                   type="number"
//                   placeholder="Valor numérico..."
//                   value={newValue}
//                   onChange={(e) => setNewValue(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && handleAdd()}
//                   disabled={!newField}
//                   style={{ width: 180 }}
//                 />
//               ) : (
//                 <Form.Control
//                   size="sm"
//                   type="text"
//                   placeholder="Valor..."
//                   value={newValue}
//                   onChange={(e) => setNewValue(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && handleAdd()}
//                   disabled={!newField}
//                   style={{ width: 250 }}
//                 />
//               )}
//             </div>

//             <div className="col-auto">
//               <Button size="sm" variant="primary" onClick={handleAdd} disabled={!newField || (isMultiValueOperator ? !multiValueInput.trim() : !newValue && newValue !== 0 && newValue !== false)}>
//                 <i className="bi bi-plus-lg" />
//               </Button>
//             </div>
//           </div>

//           {/* Ayuda para valores múltiples */}
//           {isMultiValueOperator && (
//             <div className="mt-2">
//               <small className="text-muted">
//                 <i className="bi bi-info-circle me-1" />
//                 Ingresa múltiples valores separados por coma. Ejemplo: Activo, Pendiente, Completado o 1, 2, 3
//               </small>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// // Helpers para tipos y operadores
// function getOperatorsForType(type?: string): string[] {
//   switch (type) {
//     case "number":
//     case "date":
//     case "datetime":
//       return ["=", "!=", ">", ">=", "<", "<=", "in", "notIn"];
//     case "boolean":
//       return ["=", "!="];
//     case "relation":
//       return ["=", "!=", "contains", "in", "notIn"];
//     default:
//       return ["=", "!=", "contains", "startsWith", "endsWith", "in", "notIn"];
//   }
// }

// function operatorLabel(op: string): string {
//   const labels: Record<string, string> = {
//     "=": "=",
//     "!=": "≠",
//     contains: "contiene",
//     startsWith: "empieza con",
//     endsWith: "termina con",
//     ">": ">",
//     ">=": "≥",
//     "<": "<",
//     "<=": "≤",
//     in: "está en",
//     notIn: "no está en",
//     some: "contiene",
//     every: "todos",
//     none: "ninguno",
//   };
//   return labels[op] || op;
// }

// function convertValue(value: string, type?: string): any {
//   if (!value && value !== "0") return value;

//   switch (type) {
//     case "number":
//       const num = Number(value);
//       return isNaN(num) ? 0 : num;
//     case "boolean":
//       return value === "true";
//     case "date":
//       return value;
//     case "datetime":
//       return value;
//     default:
//       return value;
//   }
// }

// function formatFilterValue(value: any, type?: string): string {
//   if (value == null) return "";

//   // Si es array (para operadores in/notIn)
//   if (Array.isArray(value)) {
//     if (value.length === 0) return "[]";
//     if (value.length <= 3) {
//       return value.join(", ");
//     }
//     return `${value.slice(0, 3).join(", ")}... (${value.length} valores)`;
//   }

//   if (type === "boolean") {
//     return value ? "Sí" : "No";
//   }

//   if (type === "datetime" && value) {
//     try {
//       return toDateTimeLocal(value);
//     } catch {
//       return String(value);
//     }
//   }

//   if (type === "date" && value) {
//     try {
//       return toDateOnly(value);
//     } catch {
//       return String(value);
//     }
//   }

//   return String(value);
// }

// components/FilterBuilder.tsx
import { ColumnConfig, FilterValue } from "@/app/libs/definitions";
import { toDateOnly, toDateTimeLocal } from "@/app/libs/validatorDate";
import { useState, useEffect } from "react";
import { Button, Form, Badge } from "react-bootstrap";

interface FilterBuilderProps {
  columns: ColumnConfig[];
  filters?: FilterValue[];
  onChange: (filters: FilterValue[]) => void;
  storageKey?: string; // Clave para localStorage
}

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

  // 🆕 Estado para "entre" (between)
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");

  // Estado interno para los filtros (si no se usan props externos)
  const [internalFilters, setInternalFilters] = useState<FilterValue[]>([]);

  // Usar filtros externos o internos
  const filters =
    externalFilters !== undefined ? externalFilters : internalFilters;

  // Cargar filtros guardados al iniciar
  useEffect(() => {
    try {
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
      console.error("Error loading filters from localStorage:", error);
    }
  }, []);

  // Guardar filtros en localStorage cuando cambien
  useEffect(() => {
    try {
      if (filters.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(filters));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error("Error saving filters to localStorage:", error);
    }
  }, [filters, storageKey]);

  const selectedColumn = columns.find((c) => c.field === newField);
  const columnType = selectedColumn?.type || "string";
  const operators = getOperatorsForType(columnType);
  const isMultiValueOperator = newOperator === "in" || newOperator === "notIn";
  const isRangeOperator = newOperator === "between";

  // Función para actualizar filtros
  const updateFilters = (newFilters: FilterValue[]) => {
    if (externalFilters !== undefined) {
      onChange(newFilters);
    } else {
      setInternalFilters(newFilters);
    }
  };

  // components/FilterBuilder.tsx - Actualizar la función handleAdd

  const handleAdd = () => {
    if (!newField) return;

    let typedValue: any = newValue;

    // 🆕 Manejar operador "between" - convertir a objeto con gte/lte
    if (isRangeOperator) {
      if (!rangeFrom || !rangeTo) return;

      // Validar que el rango sea válido
      if (rangeFrom > rangeTo) {
        alert("La fecha inicial debe ser menor o igual a la fecha final");
        return;
      }

      // 🔥 Convertir a formato Prisma: { gte: "2026-07-11", lte: "2026-07-12" }
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

    // Resetear formulario
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
  };

  const handleOperatorChange = (operator: string) => {
    setNewOperator(operator);
    setNewValue("");
    setMultiValueInput("");
    setRangeFrom("");
    setRangeTo("");
  };

  // 🆕 Renderizar el input según el operador y tipo
  const renderValueInput = () => {
    // Operador "between"
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

    // Operadores in/notIn
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

    // Tipos específicos
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

  // 🆕 Verificar si el botón de añadir debe estar habilitado
  const isAddDisabled = () => {
    if (!newField) return true;

    if (isRangeOperator) {
      return !rangeFrom || !rangeTo;
    }

    if (isMultiValueOperator) {
      return !multiValueInput.trim();
    }

    return !newValue && newValue !== 0 && newValue !== false;
  };

  return (
    <div className="mb-3">
      <div className="d-flex align-items-center gap-2 mb-2">
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

        {filters.length > 0 && (
          <Button size="sm" variant="outline-danger" onClick={handleClearAll}>
            <i className="bi bi-trash" /> Limpiar
          </Button>
        )}
      </div>

      {/* Indicador de persistencia */}
      {filters.length > 0 && (
        <div className="mb-2">
          <small className="text-muted">
            <i className="bi bi-database-check me-1" />
            Filtros guardados en el navegador
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

          {/* Ayuda para valores múltiples */}
          {isMultiValueOperator && (
            <div className="mt-2">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1" />
                Ingresa múltiples valores separados por coma. Ejemplo: Activo,
                Pendiente, Completado o 1, 2, 3
              </small>
            </div>
          )}

          {/* 🆕 Ayuda para rango */}
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
