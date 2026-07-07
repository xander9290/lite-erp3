"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Form, FloatingLabel } from "react-bootstrap";
import { useAccess } from "@/contexts/AccessContext";
import styles from "./FieldSelect.module.css";

interface FieldSelectProps {
  name: string;
  label?: string;
  disabled?: boolean;
  invisible?: boolean;
  inline?: boolean;
  onChange?: (value: string | number) => void;
  className?: string;
  options: { value: string | number; label: string }[];
  readonly?: boolean;
  placeholder?: string;
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
  readonly,
  placeholder = "",
}: FieldSelectProps) {
  const access = useAccess({ fieldName: name });
  const { control } = useFormContext();

  if (!options) {
    throw new Error("La propiedad [options] es requerida en FieldSelect");
  }

  if (invisible || access?.invisible) return null;

  const floatingText = label ?? name;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState, formState: { isSubmitting } }) => {
        const isDisabled =
          isSubmitting || disabled || access?.readonly || readonly;

        const selectControl = (
          <Form.Select
            {...field}
            id={name}
            title={name}
            isInvalid={!!fieldState.error}
            value={field.value ?? ""}
            autoComplete="off"
            disabled={isDisabled}
            className={[
              styles.selectControl,
              inline ? styles.inlineSelect : "",
              className ?? "",
            ].join(" ")}
            onChange={(e) => {
              const raw = e.target.value;
              const matched = options.find((opt) => String(opt.value) === raw);
              const val = matched ? matched.value : raw;

              field.onChange(val);
              onChange?.(val);
            }}
          >
            <option value="">{placeholder}</option>

            {options.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
        );

        const feedback = (
          <Form.Control.Feedback
            type="invalid"
            className={
              fieldState.error ? styles.feedbackVisible : styles.feedback
            }
          >
            {fieldState.error?.message}
          </Form.Control.Feedback>
        );

        if (inline) {
          return (
            <div title={name} className={styles.inlineWrapper}>
              {selectControl}
              {feedback}
            </div>
          );
        }

        return (
          <div title={name} className={styles.fieldWrapper}>
            <FloatingLabel
              controlId={name}
              label={floatingText}
              className={styles.floatingLabel}
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
