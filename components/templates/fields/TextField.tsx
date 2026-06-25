import { Form } from "react-bootstrap";
import { FieldInputProps } from "./FieldEntry";

export function TextField({ field, fieldState, name, placeholder, readonly, inline, className, rows = 1, cols, autoFocus, onChange, as, type }: FieldInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const el = e.target;
    const value = el.value;

    if (el.tagName === "TEXTAREA") {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }

    field.onChange(value);
    onChange?.(value);
  };

  return (
    <Form.Control
      ref={(el: HTMLInputElement | HTMLTextAreaElement | null) => {
        if (el?.tagName === "TEXTAREA") {
          el.style.height = "auto";
          el.style.height = `${el.scrollHeight}px`;
        }
      }}
      className={`${className ?? ""} ${type === "password" ? "text-center" : ""} shadow-none w-100 overflow-hidden px-1 ${inline ? "border-0" : ""}`}
      title={name}
      as={as}
      type={type}
      isInvalid={!!fieldState.error}
      placeholder={placeholder}
      readOnly={readonly}
      value={field.value ?? ""}
      rows={rows}
      cols={cols}
      autoComplete="off"
      autoFocus={autoFocus}
      style={{
        fontSize: "0.9rem",
        resize: "none",
      }}
      onChange={handleChange}
      onBlur={field.onBlur}
      name={field.name}
    />
  );
}
