"use client";

import { ReactNode } from "react";
import { useAccess } from "@/contexts/AccessContext";

export interface PageProps {
  children: ReactNode;
  eventKey: string;
  title: string;
  invisible?: boolean;
}

export function Page({ children, eventKey, invisible }: PageProps) {
  const access = useAccess({ fieldName: eventKey || "" });

  if (access?.invisible || invisible) return null;

  return <>{children}</>;
}
