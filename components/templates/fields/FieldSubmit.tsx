"use client";
import { useAccess } from "@/contexts/AccessContext";
import { Button, Spinner } from "react-bootstrap";
import { useFormContext, Controller } from "react-hook-form";

export function FieldSubmit({
  name,
  label,
  disabled,
  invisible,
}: {
  name: string;
  label: string;
  disabled?: boolean;
  invisible?: boolean;
}) {
  const access = useAccess({ fieldName: name });

  const { control } = useFormContext();

  if (invisible) return null;
  if (access?.invisible) return null;

  return (
    <Controller
      name={name}
      control={control}
      render={({ formState: { isSubmitting } }) => {
        return (
          <Button
            size="sm"
            type="submit"
            title={name}
            disabled={disabled || isSubmitting || access?.readonly}
          >
            {isSubmitting ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <span className="fw-semibold">{label}</span>
            )}
          </Button>
        );
      }}
    />
  );
}
