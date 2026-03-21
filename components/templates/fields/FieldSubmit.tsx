"use client";

import { useAccess } from "@/contexts/AccessContext";
import { Button, Spinner } from "react-bootstrap";
import { useFormContext } from "react-hook-form";

export function FieldSubmit({
  name,
  label,
  disabled,
  invisible,
  feedback,
}: {
  name: string;
  label: string;
  disabled?: boolean;
  invisible?: boolean;
  feedback?: string;
}) {
  const access = useAccess({ fieldName: name });
  const { formState } = useFormContext();

  if (invisible || access?.invisible) return null;

  const isDisabled = disabled || formState.isSubmitting || access?.readonly;

  return (
    <Button
      size="sm"
      type="submit"
      title={name}
      disabled={isDisabled}
      className="fw-semibold"
    >
      {formState.isSubmitting ? (
        <>
          <Spinner size="sm" animation="border" />
          <span className="ms-2">{feedback ?? label}</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </Button>
  );
}
