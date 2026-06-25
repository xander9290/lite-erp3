import useNumberInput from "@/hooks/useNumberInput";
import { FieldInputProps } from "./FieldEntry";
import { Form } from "react-bootstrap";

export function NumberField({ field, fieldState, name, placeholder, readonly, inline, className, min = 0, max = 999999.99, step = "0.00", autoFocus, onChange, decimals = 2 }: FieldInputProps) {
  const [inputRef, displayValue, handleInput, handleFocus, handleBlur, handleKeyDown] = useNumberInput({
    initialValue: typeof field.value === "number" && !Number.isNaN(field.value) ? field.value : null,
    decimals,
    min: typeof min === "number" ? min : undefined,
    max: typeof max === "number" ? max : undefined,
    onChange: (value: number | null) => {
      field.onChange(value);
      onChange?.(value?.toString() ?? "");
    },
  });

  return (
    <Form.Control
      ref={inputRef}
      className={`${className ?? ""} text-end shadow-none w-100 overflow-hidden px-1 ${inline ? "border-0" : ""}`}
      title={name}
      type="text"
      inputMode="decimal"
      isInvalid={!!fieldState.error}
      placeholder={placeholder}
      readOnly={readonly}
      value={displayValue}
      min={min}
      max={max}
      step={step}
      autoComplete="off"
      autoFocus={autoFocus}
      style={{ fontSize: "0.9rem" }}
      onChange={handleInput}
      onFocus={handleFocus}
      onBlur={() => {
        handleBlur();
        field.onBlur();
      }}
      onKeyDown={handleKeyDown}
      name={field.name}
    />
  );
}
