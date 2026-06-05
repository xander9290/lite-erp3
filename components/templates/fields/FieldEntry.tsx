"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Form, FloatingLabel } from "react-bootstrap";
import { ElementType, useEffect, useState } from "react";
import { useAccess } from "@/contexts/AccessContext";
import toast from "react-hot-toast";
import { formatISO, format } from "date-fns";

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
  thousandsSeparator?: boolean;
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
  max?: string | number;
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

  // ✅ Usar los componentes UTC directamente en lugar de format()
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseLocalDate(value: Date) {
  const date = value.toISOString();
  const iso = formatISO(date);
  const dateISO = format(iso, "yyyy-MM-dd");
  const hourISO = format(iso, "HH:mm:ss");

  return `${dateISO}T${hourISO}`;
}

/**
 * Formatea un número con formato mexicano (miles con coma, decimales con punto)
 */
function formatMexicanNumber(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) return "";

  return value.toLocaleString("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true,
  });
}

/**
 * Parsea un string formateado (ej: "4,050.50") a número
 */
export function parseMexicanNumber(value: string): number {
  if (!value || value === "") return 0;

  // Quitar comas (separadores de miles) y convertir a número
  const cleanValue = value.replace(/,/g, "");
  const parsed = parseFloat(cleanValue);

  return isNaN(parsed) ? 0 : parsed;
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
  min = 0,
  max = 999999.99,
  step = "0.00",
  rows = 1,
  cols,
  autoFocus,
  onChange,
  as,
  decimals = 2,
  thousandsSeparator = true,
}: FieldInputProps) {
  // Estado local para el valor mostrado (solo para type="number")
  const [displayValue, setDisplayValue] = useState<string>(() => {
    if (type === "number" && typeof field.value === "number" && !isNaN(field.value)) {
      return thousandsSeparator ? formatMexicanNumber(field.value, decimals) : field.value.toString();
    }
    return field.value ?? "";
  });

  // Sincronizar cuando el valor externo cambia
  useEffect(() => {
    if (type === "number" && typeof field.value === "number" && !isNaN(field.value)) {
      const formatted = thousandsSeparator ? formatMexicanNumber(field.value, decimals) : field.value.toString();
      setDisplayValue(formatted);
    } else if (field.value !== displayValue && type !== "number") {
      setDisplayValue(field.value ?? "");
    }
  }, [field.value, type, decimals, thousandsSeparator, displayValue]);

  // Toast para errores
  useEffect(() => {
    if (fieldState.error?.message) {
      toast.error(fieldState.error.message, {
        id: name,
        position: "top-right",
      });
    }
  }, [fieldState.error?.message, name]);

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
      // Actualizar display inmediatamente
      setDisplayValue(raw);

      // Si está vacío, guardar null
      if (raw === "") {
        field.onChange(null);
        onChange?.("");
        return;
      }

      // Parsear el valor formateado a número
      const numberValue = parseMexicanNumber(raw);

      // Validar rangos
      let finalValue = numberValue;
      if (typeof min === "number" && numberValue < min) finalValue = min;
      if (typeof max === "number" && numberValue > max) finalValue = max;

      // Redondear a los decimales especificados
      const rounded = Number(finalValue.toFixed(decimals));

      // Guardar en el formulario
      field.onChange(rounded);
      onChange?.(rounded.toString());
      return;
    }

    if (type === "date") {
      // ✅ Crear la fecha como UTC al mediodía para evitar problemas de zona horaria
      //const [year, month, day] = raw.split("-").map(Number);
      //const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
      console.log(raw);
      field.onChange(new Date(raw));
      return;
    }

    if (type === "datetime-local") {
      // ✅ Parsear como UTC
      //const date = new Date(raw + "Z"); // Agregar Z para indicar UTC
      //field.onChange(date);
      const now = new Date(raw);
      field.onChange(now);
      return;
    }
    field.onChange(raw);
    onChange?.(raw);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Formatear el valor al salir del campo
    if (type === "number" && thousandsSeparator) {
      const numValue = parseMexicanNumber(e.target.value);
      if (!isNaN(numValue)) {
        const formatted = formatMexicanNumber(numValue, decimals);
        setDisplayValue(formatted);
      }
    }
    field.onBlur();
  };

  // Determinar el valor a mostrar
  const getValue = () => {
    if (type === "datetime-local") return parseLocalDate(field.value);
    if (type === "date") return toDateInputValue(field.value);
    if (type === "number") return displayValue;
    return field.value ?? "";
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
      type={type === "number" ? "text" : type} // Usar text para number para evitar problemas del navegador
      inputMode={type === "number" ? "decimal" : undefined}
      isInvalid={!!fieldState.error}
      placeholder={placeholder}
      readOnly={readonly || isSubmitting || access?.readonly}
      value={getValue()}
      min={min}
      max={max}
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
      onBlur={handleBlur}
      name={field.name}
    />
  );
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
  min = 0.0,
  step = "0.00",
  placeholder,
  as,
  cols,
  rows = 1,
  autoFocus,
  decimals = 2,
  thousandsSeparator = true,
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
            decimals={decimals}
            thousandsSeparator={thousandsSeparator}
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
