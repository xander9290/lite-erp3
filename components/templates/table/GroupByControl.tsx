// components/GroupByControl.tsx
import { ColumnConfig } from "@/app/libs/definitions";
import { useCallback, useMemo, useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";

interface GroupByControlProps {
  columns: ColumnConfig[];
  onGroupChange: (field: string | null) => void;
  storageKey?: string;
}

export function GroupByControl({ columns, onGroupChange, storageKey = "group-by-state" }: GroupByControlProps) {
  const [currentGroup, setCurrentGroup] = useState<string | null>(null);

  const groupableColumns = useMemo(() => columns.filter((col) => col.sortable !== false), [columns]);

  // Cargar agrupación guardada
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedGroup = JSON.parse(saved);
        // Verificar que la columna aún existe
        if (parsedGroup && columns.some((col) => col.field === parsedGroup)) {
          setCurrentGroup(parsedGroup);
          onGroupChange(parsedGroup);
        }
      }
    } catch (error) {
      console.error("Error loading group:", error);
    }
  }, []);

  // Guardar agrupación
  useEffect(() => {
    try {
      if (currentGroup) {
        localStorage.setItem(storageKey, JSON.stringify(currentGroup));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error("Error saving group:", error);
    }
  }, [currentGroup, storageKey]);

  const handleSelect = useCallback(
    (field: string | null) => {
      const newGroup = field === currentGroup ? null : field;
      setCurrentGroup(newGroup);
      onGroupChange(newGroup);
    },
    [currentGroup, onGroupChange],
  );

  const currentLabel = currentGroup ? columns.find((c) => c.field === currentGroup)?.label || currentGroup : "Sin agrupar";

  return (
    <Dropdown className="d-inline-block">
      <Dropdown.Toggle variant="outline-secondary" size="sm" id="group-by-dropdown">
        <i className="bi bi-collection me-1" />
        Agrupar: {currentLabel}
        {currentGroup && <i className="bi bi-database-check ms-1" style={{ fontSize: "0.7rem" }} />}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item active={!currentGroup} onClick={() => handleSelect(null)}>
          <i className="bi bi-x-circle me-2" />
          Sin agrupar
        </Dropdown.Item>

        <Dropdown.Divider />

        {groupableColumns.map((col) => (
          <Dropdown.Item key={col.field} active={currentGroup === col.field} onClick={() => handleSelect(col.field)}>
            <i className="bi bi-collection me-2" />
            {col.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
