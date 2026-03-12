"use client";

import { Button } from "react-bootstrap";

export function SimpleTD({
  children,
  colIdx,
  remove,
  action,
  contentPosition = "text-start",
}: {
  children?: React.ReactNode;
  colIdx: number;
  remove?: boolean;
  action?: () => void;
  contentPosition?: "text-start" | "text-center" | "text-end";
}) {
  if (remove) {
    if (!action)
      throw new Error("La función acción de eliminar se debe declarar");
    return (
      <td
        valign="middle"
        className={`p-0 border-end text-truncate ${contentPosition}`}
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        data-column-index={colIdx}
      >
        <Button size="sm" variant="link" onClick={action}>
          <i className="bi bi-trash"></i>
        </Button>
      </td>
    );
  } else {
    return (
      <td
        valign="middle"
        className={`p-0 text-truncate ${contentPosition}`}
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        data-column-index={colIdx}
      >
        {children}
      </td>
    );
  }
}

export default SimpleTD;
