import { Form } from "react-bootstrap";
import { FieldInputProps } from "./FieldEntry";

export function DateTimeField({ field, fieldState, name, placeholder, readonly, inline, className, min, max, autoFocus, onChange }: FieldInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // "" o "2026-07-04T15:30"

    field.onChange(value);
    onChange?.(value);
  };

  return (
    <Form.Control
      className={`${className ?? ""} shadow-none w-100 overflow-hidden px-1 ${inline ? "border-0" : ""}`}
      title={name}
      type="datetime-local"
      isInvalid={!!fieldState.error}
      placeholder={placeholder}
      readOnly={readonly}
      value={field.value ?? ""}
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
