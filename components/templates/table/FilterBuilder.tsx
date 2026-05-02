// components/FilterBuilder.tsx
import { ColumnConfig, FilterValue } from "@/app/libs/definitions";
import { useState } from "react";
import { Button, Form, Badge } from "react-bootstrap";

interface FilterBuilderProps {
  columns: ColumnConfig[];
  filters: FilterValue[];
  onChange: (filters: FilterValue[]) => void;
}

export function FilterBuilder({
  columns,
  filters,
  onChange,
}: FilterBuilderProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [newField, setNewField] = useState("");
  const [newOperator, setNewOperator] = useState("contains");
  const [newValue, setNewValue] = useState("");

  const selectedColumn = columns.find((c) => c.field === newField);
  const columnType = selectedColumn?.type || "string";
  const operators = getOperatorsForType(columnType);

  // Sin useCallback - React Compiler lo optimiza solo
  const handleAdd = () => {
    if (!newField || !newValue) return;

    const typedValue = convertValue(newValue, columnType);

    onChange([
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
  };

  const handleRemove = (index: number) => {
    onChange(filters.filter((_, i) => i !== index));
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
          <Button
            size="sm"
            variant="outline-danger"
            onClick={() => onChange([])}
          >
            <i className="bi bi-trash" />
          </Button>
        )}
      </div>

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
                    setNewOperator(getOperatorsForType(col.type)[0]);
                  }
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
                onChange={(e) => setNewOperator(e.target.value)}
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
              <Form.Label className="small mb-1">Valor</Form.Label>
              {columnType === "date" ? (
                <Form.Control
                  size="sm"
                  type="date"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  disabled={!newField}
                />
              ) : columnType === "datetime" ? (
                <Form.Control
                  size="sm"
                  type="datetime-local"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  disabled={!newField}
                />
              ) : columnType === "boolean" ? (
                <Form.Select
                  size="sm"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  disabled={!newField}
                >
                  <option value="">Seleccionar...</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </Form.Select>
              ) : columnType === "number" ? (
                <Form.Control
                  size="sm"
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  disabled={!newField}
                />
              ) : (
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="Valor..."
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  disabled={!newField}
                />
              )}
            </div>

            <div className="col-auto">
              <Button
                size="sm"
                variant="primary"
                onClick={handleAdd}
                disabled={!newField || !newValue}
              >
                <i className="bi bi-plus-lg" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers para tipos y operadores
function getOperatorsForType(type?: string): string[] {
  switch (type) {
    case "number":
    case "date":
    case "datetime":
      return ["=", "!=", ">", ">=", "<", "<="];
    case "boolean":
      return ["=", "!="];
    default:
      return ["=", "!=", "contains", "startsWith", "endsWith"];
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
    some: "contiene",
    every: "empieza con",
    none: "no contiene",
  };
  return labels[op] || op;
}

function convertValue(value: string, type?: string): any {
  if (!value) return value;

  switch (type) {
    case "number":
      return Number(value);
    case "boolean":
      return value === "true";
    case "date":
      return value; // Se manejará como string ISO
    case "datetime":
      return value; // Se manejará como string ISO
    default:
      return value;
  }
}

function formatFilterValue(value: any, type?: string): string {
  if (value == null) return "";

  if (type === "datetime" && value) {
    try {
      return new Date(value).toLocaleDateString("es-MX");
    } catch {
      return String(value);
    }
  }

  return String(value);
}
