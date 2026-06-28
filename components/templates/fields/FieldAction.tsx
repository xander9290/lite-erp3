"use client";

import { useAccess } from "@/contexts/AccessContext";
import React from "react";
import { Button } from "react-bootstrap";
import { ButtonVariant } from "react-bootstrap/cjs/types";

export function FieldAction({
  name,
  label,
  disabled,
  invisible,
  action,
  variant = "primary",
  size,
  icon,
  className,
}: {
  name: string;
  label: string;
  disabled?: boolean;
  invisible?: boolean;
  feedback?: string;
  variant?: ButtonVariant;
  action: () => void;
  size?: "sm" | "lg";
  icon?: React.ReactNode;
  className?: string;
}) {
  const access = useAccess({ fieldName: name });

  if (invisible || access?.invisible) return null;

  const isDisabled = disabled || access?.readonly;

  return (
    <Button type="button" title={name} disabled={isDisabled} className={`fw-semibold ${className}`} onClick={action} variant={variant} size={size}>
      {icon && <span className="me-1">{icon}</span>}
      <span>{label}</span>
    </Button>
  );
}
