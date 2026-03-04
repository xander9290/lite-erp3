"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Form } from "react-bootstrap";
import { round } from "@/app/libs/helpers";

interface FieldEntryProps {
  name: string;
  label?: string;
  readonly?: boolean;
  invisible?: boolean;
  inline?: boolean;
  onChange?: (value: string) => void;
  className?: string;
  type?: React.HTMLInputTypeAttribute;
  min?: string | number;
  autoFocus?: boolean;
}

export function FieldEntry({
  name,
  label,
  readonly,
  invisible,
  inline,
  onChange,
  className,
  type = "text",
  min,
  autoFocus,
}: FieldEntryProps) {
  const { control } = useFormContext();

  if (invisible) return null;

  const input = (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState, formState: { isSubmitting } }) => (
        <>
          <Form.Control
            className={`${className} ${type === "password" && "text-center"} ${
              !inline && "border-bottom"
            } shadow-none rounded-0 border-0`}
            {...field}
            id={name}
            title={name}
            type={type}
            isInvalid={!!fieldState.error}
            readOnly={readonly}
            disabled={isSubmitting}
            value={field.value ?? ""}
            size="sm"
            min={min}
            autoComplete="off"
            autoFocus={autoFocus}
            onChange={(e) => {
              const val = e.target.value;
              if (type === "number") round(Number(val), 2);
              field.onChange(val);
              onChange?.(val);
            }}
          />
          <Form.Control.Feedback type="invalid">
            {fieldState.error?.message}
          </Form.Control.Feedback>
        </>
      )}
    />
  );

  if (inline) {
    return (
      <div title={name} className="m-0 p-0">
        {input}
      </div>
    );
  }

  return (
    <Form.Group className="mb-3">
      {
        <Form.Label htmlFor={name} className="fw-semibold m-0 p-0">
          {label}
        </Form.Label>
      }
      {input}
    </Form.Group>
  );
}
