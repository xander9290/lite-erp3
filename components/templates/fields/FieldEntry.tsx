"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Form } from "react-bootstrap";
import { round } from "@/app/libs/helpers";
import { format } from "date-fns";

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
  autoFocus,
}: FieldEntryProps) {
  const { control } = useFormContext();

  if (invisible) return null;

  const input = (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState, formState: { isSubmitting } }) => {
        const inputValue =
          type === "datetime-local"
            ? toDatetimeLocalValue(field.value)
            : type === "date"
              ? toDateInputValue(field.value)
              : (field.value ?? "");

        return (
          <>
            <Form.Control
              className={`${className ?? ""} ${type === "password" ? "text-center" : ""} ${
                !inline ? "border-bottom" : ""
              } shadow-none rounded-0 border-0 w-100 p-0`}
              id={name}
              title={name}
              type={type}
              isInvalid={!!fieldState.error}
              readOnly={readonly}
              disabled={isSubmitting}
              value={inputValue}
              min={min}
              autoComplete="off"
              autoFocus={autoFocus}
              onChange={(e) => {
                const raw = e.target.value;

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
            />
            <Form.Control.Feedback type="invalid">
              {fieldState.error?.message}
            </Form.Control.Feedback>
          </>
        );
      }}
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
      <div className="d-flex flex-column align-items-sm-end gap-0 flex-sm-row">
        <Form.Label
          htmlFor={name}
          className="fw-semibold m-0 p-0 flex-shrink-0 "
          style={{ width: 100 }}
        >
          {label}
        </Form.Label>

        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          {input}
        </div>
      </div>
    </Form.Group>
  );
}
