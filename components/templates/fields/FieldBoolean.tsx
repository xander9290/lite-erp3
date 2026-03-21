import { useFormContext, Controller } from "react-hook-form";
import { Form } from "react-bootstrap";
import { FormCheckType } from "react-bootstrap/esm/FormCheck";
import { useAccess } from "@/contexts/AccessContext";

interface FieldBooleanProps {
  label?: string;
  name: string;
  type?: FormCheckType;
  readonly?: boolean;
  invisible?: boolean;
  inline?: boolean;
  disabled?: boolean;
}

export function FieldBoolean({
  label,
  name,
  type = "switch",
  readonly,
  invisible,
  inline,
  disabled,
}: FieldBooleanProps) {
  const { control } = useFormContext();

  const access = useAccess({ fieldName: name });

  if (invisible) return null;
  if (access?.invisible) return null;

  const input = (
    <Controller
      name={name}
      control={control}
      render={({ field, formState: { isSubmitting } }) => (
        <Form.Check
          type={type}
          title={name}
          label={label}
          disabled={disabled || isSubmitting || readonly || access?.readonly}
          checked={!!field.value}
          onChange={(e) => field.onChange(e.target.checked)}
          onBlur={field.onBlur}
          style={{ fontSize: "0.9rem" }}
        />
      )}
    />
  );

  if (inline) {
    return (
      <div title={name} className="p-0 m-0">
        {input}
      </div>
    );
  }

  return (
    <Form.Group className="mb-3" controlId={label}>
      {input}
    </Form.Group>
  );
}
