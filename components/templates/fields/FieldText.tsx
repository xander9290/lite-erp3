"use client";

import { useAccess } from "@/contexts/AccessContext";

export function FieldText({
  name,
  invisible,
  output,
  className,
}: {
  name: string;
  invisible?: boolean;
  output: string | null | undefined;
  className?: string;
}) {
  const access = useAccess({ fieldName: name });

  if (invisible) return null;
  if (access?.invisible) return null;

  return (
    <span className={`text-truncate m-0 ${className}`} title={name}>
      {output ? output : null}
    </span>
  );
}
