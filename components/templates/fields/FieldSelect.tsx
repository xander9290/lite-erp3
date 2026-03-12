"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Form, FloatingLabel } from "react-bootstrap";

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

  if (!options) {
    throw new Error("La propiedad [options] es requerida en FieldSelect");
  }

  if (invisible) return null;

  const floatingText = label ?? name;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selectControl = (
          <Form.Select
            {...field}
            id={name}
            title={name}
            isInvalid={!!fieldState.error}
            value={field.value ?? ""}
            autoComplete="off"
            disabled={disabled}
            className={`shadow-none w-100 ${inline ? "border-0 bg-transparent rounded-0 p-0" : ""} ${className ?? ""}`}
            onChange={(e) => {
              const raw = e.target.value;

              const matched = options.find((opt) => String(opt.value) === raw);

              const val = matched ? matched.value : raw;

              field.onChange(val);
              onChange?.(val);
            }}
            style={{ fontSize: "0.9rem" }}
          >
            <option value=""></option>
            {options.map((opt) => (
              <option
                key={opt.value}
                value={String(opt.value)}
                className="bg-body-tertiary"
              >
                {opt.label}
              </option>
            ))}
          </Form.Select>
        );

        const feedback = (
          <Form.Control.Feedback
            type="invalid"
            className={fieldState.error ? "d-block" : ""}
          >
            {fieldState.error?.message}
          </Form.Control.Feedback>
        );

        if (inline) {
          return (
            <div title={name} className="m-0 p-0">
              {selectControl}
              {feedback}
            </div>
          );
        }

        return (
          <div title={name} className="mb-3">
            <FloatingLabel
              controlId={name}
              label={floatingText}
              className="w-100"
            >
              {selectControl}
            </FloatingLabel>
            {feedback}
          </div>
        );
      }}
    />
  );
}
