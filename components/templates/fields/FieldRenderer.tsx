import { DateField } from "./DateField";
import { DateTimeField } from "./DateTimeField";
import { FieldInputProps } from "./FieldEntry";
import { NumberField } from "./NumberField";
import { TextField } from "./TextField";

function FieldRenderer(props: FieldInputProps) {
  console.log(props.type);
  switch (props.type) {
    case "number":
      return <NumberField {...props} />;

    case "date":
      return <DateField {...props} />;

    case "datetime-local":
      return <DateTimeField {...props} />;

    case "password":
      return <TextField {...props} />;

    default:
      return <TextField {...props} />;
  }
}

export default FieldRenderer;
