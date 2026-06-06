"use client";

import { extractEntityFromPath } from "@/contexts/AccessContext";
import { useAuth } from "@/hooks/sessionStore";
import { usePathname } from "next/navigation";

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
  const { access } = useAuth();

  const pathName = usePathname();
  const entity = extractEntityFromPath(pathName);
  const modelAccess = access.filter((acc) => acc.entityType === entity);

  const fieldRow = modelAccess.find((acc) => acc.fieldName === name);
  if (fieldRow && fieldRow.invisible) return null;

  return (
    <td
      title={name}
      valign="middle"
      className={`p-0 text-truncate ${contentPosition} border`}
      style={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      data-column-index={colIdx}
    >
      <fieldset
        disabled={fieldRow && fieldRow.readonly === true ? true : false}
      >
        {children}
      </fieldset>
    </td>
  );
}

export default SimpleTD;
