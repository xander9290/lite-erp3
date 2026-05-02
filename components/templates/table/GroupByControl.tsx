// components/GroupByControl.tsx
import { ColumnConfig } from "@/app/libs/definitions";
import { useCallback, useMemo } from "react";
import { Dropdown } from "react-bootstrap";

interface GroupByControlProps {
  columns: ColumnConfig[];
  currentGroup: string | null;
  onGroupChange: (field: string | null) => void;
}

export function GroupByControl({
  columns,
  currentGroup,
  onGroupChange,
}: GroupByControlProps) {
  const groupableColumns = useMemo(
    () => columns.filter((col) => col.sortable !== false),
    [columns],
  );

  const handleSelect = useCallback(
    (field: string | null) => {
      onGroupChange(field === currentGroup ? null : field);
    },
    [currentGroup, onGroupChange],
  );

  const currentLabel = currentGroup
    ? columns.find((c) => c.field === currentGroup)?.label || currentGroup
    : "Sin agrupar";

  return (
    <Dropdown className="d-inline-block">
      <Dropdown.Toggle
        variant="outline-secondary"
        size="sm"
        id="group-by-dropdown"
      >
        <i className="bi bi-collection me-1" />
        Agrupar: {currentLabel}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item
          active={!currentGroup}
          onClick={() => handleSelect(null)}
        >
          <i className="bi bi-x-circle me-2" />
          Sin agrupar
        </Dropdown.Item>

        <Dropdown.Divider />

        {groupableColumns.map((col) => (
          <Dropdown.Item
            key={col.field}
            active={currentGroup === col.field}
            onClick={() => handleSelect(col.field)}
          >
            <i className="bi bi-collection me-2" />
            {col.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
