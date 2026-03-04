"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Form } from "react-bootstrap";

interface FieldSelectProps {
  name: string;
  label?: string;
  disabled?: boolean;
  invisible?: boolean;
  inline?: boolean;
  onChange?: (value: string | number) => void;
  className?: string;
  options: { value: string | number; label: string }[];
}

export function FieldSelect({
  name,
  label,
  disabled,
  invisible,
  inline,
  onChange,
  className,
  options,
}: FieldSelectProps) {
  const { control } = useFormContext();

  if (!options)
    throw new Error("La propiedad [options] es requerida en FieldSelect");

  if (invisible) return null;

  if (inline) {
    return (
      <div title={name}>
        <Controller
          name={name}
          control={control}
          render={({ field, fieldState }) => (
            <>
              <Form.Select
                className={`${className} border-0 bg-body-tertiary shadow-none`}
                {...field}
                id={name}
                title={name}
                isInvalid={!!fieldState.error}
                value={field.value ?? ""}
                size="sm"
                autoComplete="off"
                disabled={disabled}
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val);
                  onChange?.(val);
                }}
              >
                <option value=""></option>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {fieldState.error?.message}
              </Form.Control.Feedback>
            </>
          )}
        />
      </div>
    );
  }

  return (
    <Form.Group className="mb-2 d-flex justify-content-between align-items-end gap-1">
      {
        <Form.Label htmlFor={name} className="fw-semibold m-0 p-0 w-25">
          {label}
        </Form.Label>
      }
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <Form.Select
              className={`${className} border-0 bg-body-tertiary rounded-0 w-75`}
              {...field}
              id={name}
              title={name}
              isInvalid={!!fieldState.error}
              value={field.value}
              size="sm"
              autoComplete="off"
              disabled={disabled}
              onChange={(e) => {
                const val = e.target.value;
                field.onChange(val);
                onChange?.(val);
              }}
            >
              <option value=""></option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {fieldState.error?.message}
            </Form.Control.Feedback>
          </>
        )}
      />
    </Form.Group>
  );
}
