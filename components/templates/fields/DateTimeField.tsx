// import { Form } from "react-bootstrap";
// import { FieldInputProps } from "./FieldEntry";
// import { format } from "date-fns";

// export function DateTimeField({
//   field,
//   fieldState,
//   name,
//   placeholder,
//   readonly,
//   inline,
//   className,
//   min,
//   max,
//   autoFocus,
//   onChange,
// }: FieldInputProps) {
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value; // "" o "2026-07-04T15:30"

//     field.onChange(new Date(value));
//     onChange?.(new Date(value).toISOString());
//   };

//   return (
//     <Form.Control
//       className={`${className ?? ""} shadow-none w-100 overflow-hidden px-1 ${inline ? "border-0" : ""}`}
//       title={name}
//       type="datetime-local"
//       isInvalid={!!fieldState.error}
//       placeholder={placeholder}
//       readOnly={readonly}
//       value={format(field.value || null, "yyyy-MM-dd'T'HH:mm:ss") ?? ""}
//       min={min}
//       max={max}
//       autoComplete="off"
//       autoFocus={autoFocus}
//       style={{ fontSize: "0.9rem" }}
//       onChange={handleChange}
//       onBlur={field.onBlur}
//       name={field.name}
//     />
//   );
// }
import { Form } from "react-bootstrap";
import { FieldInputProps } from "./FieldEntry";
import { format } from "date-fns";

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
    const value = e.target.value;

    if (value === "") {
      field.onChange(null);
      onChange?.("");
      return;
    }

    const date = new Date(value);
    field.onChange(date);
    onChange?.(date.toISOString());
  };

  // Formatear el valor solo si existe
  const getValue = () => {
    if (!field.value) return "";

    try {
      return format(new Date(field.value), "yyyy-MM-dd'T'HH:mm:ss");
    } catch {
      return "";
    }
  };

  return (
    <Form.Control
      className={`${className ?? ""} shadow-none w-100 overflow-hidden px-1 ${inline ? "border-0" : ""}`}
      title={name}
      type="datetime-local"
      isInvalid={!!fieldState.error}
      placeholder={placeholder}
      readOnly={readonly}
      value={getValue()}
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
