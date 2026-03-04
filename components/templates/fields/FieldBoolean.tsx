import { useFormContext, Controller } from "react-hook-form";
import { Form } from "react-bootstrap";
import { FormCheckType } from "react-bootstrap/esm/FormCheck";

interface FieldBooleanProps {
  label?: string;
  name: string;
  type?: FormCheckType;
  readonly?: boolean;
  invisible?: boolean;
  inline?: boolean;
}

export function FieldBoolean({
  label,
  name,
  type = "switch",
  readonly,
  invisible,
  inline,
}: FieldBooleanProps) {
  const { control } = useFormContext();

  if (invisible) return null;

  const input = (
    <Controller
      name={name}
      control={control}
      render={({ field, formState: { isSubmitting } }) => (
        <Form.Check
          type={type}
          title={name}
          label={label}
          disabled={isSubmitting}
          readOnly={readonly}
          checked={!!field.value}
          onChange={(e) => field.onChange(e.target.checked)}
          onBlur={field.onBlur}
        />
      )}
    />
  );

  if (inline) {
    return <div title={name}>{input}</div>;
  }

  return (
    <Form.Group className="mb-3" controlId={label}>
      {input}
    </Form.Group>
  );
}
