"use client";
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
  const { control } = useFormContext();

  if (invisible) return null;

  return (
    <Controller
      name={name}
      control={control}
      render={({ formState: { isSubmitting } }) => {
        return (
          <Button size="sm" type="submit" disabled={disabled || isSubmitting}>
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
