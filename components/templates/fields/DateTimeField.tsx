import { Form } from "react-bootstrap";
import { FieldInputProps } from "./FieldEntry";
import { format, formatISO } from "date-fns";

function parseLocalDate(value: Date) {
  const date = !value ? new Date().toISOString() : value.toISOString();
  const iso = formatISO(date);
  const dateISO = format(iso, "yyyy-MM-dd");
  const hourISO = format(iso, "HH:mm:ss");

  return `${dateISO}T${hourISO}`;
}

export function DateTimeField({
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

    const date = new Date(raw);

    field.onChange(date);
    onChange?.(raw);
  };

  return (
    <Form.Control
      className={`${className ?? ""} shadow-none w-100 overflow-hidden px-1 ${
        inline ? "border-0" : ""
      }`}
      title={name}
      type="datetime-local"
      isInvalid={!!fieldState.error}
      placeholder={placeholder}
      readOnly={readonly}
      value={field.value ? parseLocalDate(field.value) : ""}
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
