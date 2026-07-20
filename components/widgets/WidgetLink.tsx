"use client";

import { useAccess } from "@/contexts/AccessContext";
import Link from "next/link";

interface WidgetLinkProps {
  readonly?: boolean;
  name: string;
  link?: string | null;
  string?: string | null;
  title?: string;
}

export function WidgetLink({
  readonly = false,
  name,
  link,
  string,
  title,
}: WidgetLinkProps) {
  const access = useAccess({ fieldName: name });

  const isReadonly = readonly || access?.readonly || !link;
  const label = string?.trim() || "Sin información";

  if (isReadonly) {
    return <span className="text-body">{label}</span>;
  }

  return (
    <Link
      href={link}
      className="
        gap-1
        text-decoration-none
        link-primary
        link-offset-2
        link-underline-opacity-0
        link-underline-opacity-100-hover
      "
      title={title ?? `${label}`}
      aria-label={`Abrir ${label}`}
    >
      <span className="align-middle">{label}</span>

      <i
        className="bi bi-box-arrow-up-right small ms-1"
        aria-hidden="true"
        title={name}
      />
    </Link>
  );
}
