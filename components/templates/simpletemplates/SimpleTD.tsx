"use client";

import { useAccess } from "@/contexts/AccessContext";

export function SimpleTD({
  children,
  colIdx,
  contentPosition = "text-start",
  name,
}: {
  children?: React.ReactNode;
  colIdx: number;
  contentPosition?: "text-start" | "text-center" | "text-end";
  name: string;
}) {
  const access = useAccess({ fieldName: name });

  if (access?.invisible)
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
      ></td>
    );

  return (
    <td
      title={name}
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

export default SimpleTD;
