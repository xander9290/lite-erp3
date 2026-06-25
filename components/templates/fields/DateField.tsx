import { Form } from "react-bootstrap";
import { FieldInputProps } from "./FieldEntry";

function toDateInputValue(value: unknown): string {
  if (value == null || value === "") return "";

  const d =
    value instanceof Date
      ? value
      : typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : null;

  if (!d || isNaN(d.getTime())) return "";

  // ✅ Usar los componentes UTC directamente en lugar de format()
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function DateField({
  field,
  fieldState,
  name,
  placeholder,
  readonly,
  inline,
  className,
  min,
  max,
  autoFocus,
  onChange,
}: FieldInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (!raw) {
      field.onChange(null);
      onChange?.("");
      return;
    }

    field.onChange(new Date(raw));
    onChange?.(raw);
  };

  return (
    <Form.Control
      className={`${className ?? ""} shadow-none w-100 overflow-hidden px-1 ${
        inline ? "border-0" : ""
      }`}
      title={name}
      type="date"
      isInvalid={!!fieldState.error}
      placeholder={placeholder}
      readOnly={readonly}
      value={toDateInputValue(field.value)}
      min={min}
      max={max}
      autoComplete="off"
      autoFocus={autoFocus}
      style={{ fontSize: "0.9rem" }}
      onChange={handleChange}
      onBlur={field.onBlur}
      name={field.name}
    />
  );
}
