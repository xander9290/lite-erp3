"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Form, FloatingLabel } from "react-bootstrap";
import { round } from "@/app/libs/helpers";
import { format } from "date-fns";
import { ElementType } from "react";
import { useAccess } from "@/contexts/AccessContext";

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
  placeholder?: string;
  as?: ElementType;
  cols?: number;
  rows?: number;
  autoFocus?: boolean;
}

function toDateInputValue(value: unknown): string {
  if (value == null || value === "") return "";

  const d =
    value instanceof Date
      ? value
      : typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : null;

  if (!d || isNaN(d.getTime())) return "";
  return format(d, "yyyy-MM-dd");
}

function toDatetimeLocalValue(value: unknown): string {
  if (value == null || value === "") return "";

  const d =
    value instanceof Date
      ? value
      : typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : null;

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
  placeholder,
  as,
  cols,
  rows = 1,
  autoFocus,
}: FieldEntryProps) {
  const { control } = useFormContext();

  const access = useAccess({ fieldName: name });

  if (invisible) return null;
  if (access && access.invisible) return;

  const rules = {
    validate: (value: any) => {
      console.log(value);
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
      render={({ field, fieldState, formState: { isSubmitting } }) => {
        const inputValue =
          type === "datetime-local"
            ? toDatetimeLocalValue(field.value)
            : type === "date"
              ? toDateInputValue(field.value)
              : (field.value ?? "");

        const floatingText = label ?? placeholder ?? name;
        const effectivePlaceholder = placeholder;

        const isTextarea = as != null ? as === "textarea" : type === "text";

        const input = (
          <Form.Control
            ref={(el: HTMLInputElement | HTMLTextAreaElement | null) => {
              if (el && el.tagName === "TEXTAREA") {
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
              }
            }}
            className={`${className ?? ""} ${
              type === "password" ? "text-center" : ""
            } shadow-none w-100 overflow-hidden px-1 ${inline ? "border-0" : "bg-body-tertiary"}`}
            id={name}
            title={name}
            as={as ?? (type === "text" ? "textarea" : undefined)}
            type={type}
            isInvalid={!!fieldState.error}
            placeholder={effectivePlaceholder}
            readOnly={readonly || isSubmitting || access?.readonly}
            value={inputValue}
            min={min}
            rows={isTextarea ? rows : undefined}
            cols={cols}
            autoComplete="off"
            style={{
              fontSize: "0.9rem",
              resize: isTextarea ? "none" : undefined,
            }}
            autoFocus={autoFocus}
            onChange={(e) => {
              const el = e.target as HTMLInputElement | HTMLTextAreaElement;

              if (el.tagName === "TEXTAREA") {
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
              }

              const raw = el.value;

              if (type === "number") {
                const n = Number(raw);
                const rounded = Number.isFinite(n) ? round(n, 2) : raw;
                field.onChange(rounded);
                onChange?.(String(rounded));
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
            }}
            onBlur={field.onBlur}
            name={field.name}
          />
        );

        if (inline) {
          return (
            <div title={name} className="p-0 m-0 w-100">
              {input}
            </div>
          );
        }
        return (
          <div title={name} className={inline ? "m-0 p-0" : "mb-1"}>
            <FloatingLabel label={floatingText} className="w-100 fs-6 fw-bold">
              {input}
              <Form.Control.Feedback type="invalid">
                {fieldState.error?.message}
              </Form.Control.Feedback>
            </FloatingLabel>
          </div>
        );
      }}
    />
  );
}
