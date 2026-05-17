"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Form, FloatingLabel } from "react-bootstrap";
import { formatNumberForDisplay, parseNumberFromDisplay, roundToDecimals } from "@/app/libs/helpers";
import { format } from "date-fns";
import { ElementType, useEffect } from "react";
import { useAccess } from "@/contexts/AccessContext";
import toast from "react-hot-toast";

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
  placeholder?: string;
  as?: ElementType;
  cols?: number;
  rows?: number;
  autoFocus?: boolean;
  decimals?: number; // 👈 Nueva prop: cantidad de decimales (ej: 2, 3, 4)
  thousandsSeparator?: boolean; // 👈 Separador de miles
}

interface FieldInputProps {
  field: any;
  fieldState: any;
  name: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  readonly?: boolean;
  isSubmitting: boolean;
  access: any;
  inline?: boolean;
  className?: string;
  min?: string | number;
  step?: string | number;
  rows?: number;
  cols?: number;
  autoFocus?: boolean;
  onChange?: (value: string) => void;
  as?: ElementType;
  decimals?: number;
  thousandsSeparator?: boolean;
}

function toDateInputValue(value: unknown): string {
  if (value == null || value === "") return "";

  const d = value instanceof Date ? value : typeof value === "string" || typeof value === "number" ? new Date(value) : null;

  if (!d || isNaN(d.getTime())) return "";
  return format(d, "yyyy-MM-dd");
}

function toDatetimeLocalValue(value: unknown): string {
  if (value == null || value === "") return "";

  const d = value instanceof Date ? value : typeof value === "string" || typeof value === "number" ? new Date(value) : null;

  if (!d || isNaN(d.getTime())) return "";
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

function dateInputToISO(value: string): string {
  if (!value) return "";
  const d = new Date(`${value}T00:00`);
  if (isNaN(d.getTime())) return "";
  return d.toISOString();
}

function datetimeLocalToISO(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toISOString();
}

function FieldInput({
  field,
  fieldState,
  name,
  type = "text",
  placeholder,
  readonly,
  isSubmitting,
  access,
  inline,
  className,
  min,
  step = "0.00",
  rows = 1,
  cols,
  autoFocus,
  onChange,
  as,
  decimals = 2,
  thousandsSeparator,
}: FieldInputProps) {
  // Toast para errores
  useEffect(() => {
    if (fieldState.error?.message) {
      toast.error(fieldState.error.message, {
        id: name,
        position: "top-right",
      });
    }
  }, [fieldState.error?.message, name]);

  const inputValue = (() => {
    if (type === "datetime-local") return toDatetimeLocalValue(field.value);
    if (type === "date") return toDateInputValue(field.value);
    if (type === "number" && typeof field.value === "number" && !isNaN(field.value)) {
      return formatNumberForDisplay(field.value, decimals ?? 2, thousandsSeparator);
    }
    return field.value ?? "";
  })();

  const isTextarea = as === "textarea" || type === "text";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const el = e.target;
    const raw = el.value;

    // Auto-ajuste para textarea
    if (el.tagName === "TEXTAREA") {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }

    // Procesamiento según el tipo
    if (type === "number") {
      const rawValue = e.target.value;
      const numberValue = parseNumberFromDisplay(rawValue);
      const rounded = roundToDecimals(numberValue, decimals ?? 2);

      field.onChange(rounded); // Guarda el número crudo
      onChange?.(formatNumberForDisplay(rounded, decimals ?? 2, thousandsSeparator));
      return;
    }

    if (type === "datetime-local") {
      const iso = datetimeLocalToISO(raw);
      field.onChange(iso);
      onChange?.(iso);
      return;
    }

    if (type === "date") {
      const iso = dateInputToISO(raw);
      field.onChange(iso);
      onChange?.(iso);
      return;
    }

    field.onChange(raw);
    onChange?.(raw);
  };

  return (
    <Form.Control
      ref={(el: HTMLInputElement | HTMLTextAreaElement | null) => {
        if (el?.tagName === "TEXTAREA") {
          el.style.height = "auto";
          el.style.height = `${el.scrollHeight}px`;
        }
      }}
      className={`${className ?? ""} ${type === "password" ? "text-center" : type === "number" ? "text-end" : ""} shadow-none w-100 overflow-hidden px-1 ${inline ? "border-0" : ""}`}
      title={name}
      as={as ?? (type === "text" ? "textarea" : undefined)}
      type={type}
      isInvalid={!!fieldState.error}
      placeholder={placeholder}
      readOnly={readonly || isSubmitting || access?.readonly}
      value={inputValue}
      min={min}
      step={step}
      rows={isTextarea ? rows : undefined}
      cols={cols}
      autoComplete="off"
      style={{
        fontSize: "0.9rem",
        resize: isTextarea ? "none" : undefined,
      }}
      autoFocus={autoFocus}
      onChange={handleChange}
      onBlur={field.onBlur}
      name={field.name}
    />
  );
}

export function FieldEntry({ name, label, readonly, invisible, inline, onChange, className, type = "text", min, step, placeholder, as, cols, rows = 1, autoFocus }: FieldEntryProps) {
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

        const input = (
          <FieldInput
            field={field}
            fieldState={fieldState}
            name={name}
            type={type}
            placeholder={placeholder}
            step={step}
            readonly={readonly}
            isSubmitting={formState.isSubmitting}
            access={access}
            inline={inline}
            className={className}
            min={min}
            rows={rows}
            cols={cols}
            autoFocus={autoFocus}
            onChange={onChange}
            as={as}
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
          </div>
        );
      }}
    />
  );
}
