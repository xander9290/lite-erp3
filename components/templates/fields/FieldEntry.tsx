"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Form, FloatingLabel } from "react-bootstrap";
import { ElementType } from "react";
import { useAccess } from "@/contexts/AccessContext";
import FieldRenderer from "./FieldRenderer";

interface FieldEntryProps {
  name: string;
  label?: string;
  readonly?: boolean;
  invisible?: boolean;
  inline?: boolean;
  onChange?: (value: string) => void;
  className?: string;
  type?: React.HTMLInputTypeAttribute;
  step?: string | number;
  min?: string | number;
  max?: string | number;
  placeholder?: string;
  as?: ElementType;
  cols?: number;
  rows?: number;
  autoFocus?: boolean;
  decimals?: number;
}

export interface FieldInputProps {
  field: any;
  fieldState: any;
  name: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  readonly?: boolean;
  inline?: boolean;
  className?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  rows?: number;
  cols?: number;
  autoFocus?: boolean;
  onChange?: (value: string) => void;
  as?: ElementType;
  decimals?: number;
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
  min = 0,
  max,
  step = "0.00",
  placeholder,
  as,
  cols,
  rows = 1,
  autoFocus,
  decimals = 2,
}: FieldEntryProps) {
  const { control } = useFormContext();
  const access = useAccess({ fieldName: name });

  if (invisible || access?.invisible) return null;

  const rules = {
    validate: (value: any) => {
      if (access?.required && (value === "" || value == null)) {
        return "Este campo es requerido";
      }
      return true;
    },
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState, formState }) => {
        const floatingText = label ?? placeholder ?? name;

        const disabled = readonly || formState.isSubmitting || access?.readonly;

        const input = (
          <FieldRenderer
            field={field}
            fieldState={fieldState}
            name={name}
            type={type}
            placeholder={placeholder}
            readonly={disabled}
            inline={inline}
            className={className}
            min={min}
            max={max}
            step={step}
            rows={rows}
            cols={cols}
            autoFocus={autoFocus}
            onChange={onChange}
            as={as}
            decimals={decimals}
          />
        );

        if (inline) {
          return <div className="p-0 m-0 w-100">{input}</div>;
        }

        return (
          <div className="mb-1 w-100">
            <FloatingLabel label={floatingText} controlId={name} className="w-100 fs-6 fw-bold">
              {input}
            </FloatingLabel>

            {fieldState.error?.message && (
              <Form.Control.Feedback type="invalid" className="d-block small">
                {fieldState.error.message}
              </Form.Control.Feedback>
            )}
          </div>
        );
      }}
    />
  );
}
