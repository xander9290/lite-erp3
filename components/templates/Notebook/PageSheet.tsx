import { useAccess } from "@/contexts/AccessContext";
import { Row } from "react-bootstrap";

export const PageSheet = ({
  children,
  name,
  invisible,
}: {
  children: React.ReactNode;
  name?: string;
  invisible?: boolean;
  readonly?: boolean;
}) => {
  const access = useAccess({ fieldName: name || "" });

  if (invisible) return null;
  if (access?.invisible) return null;

  return (
    <Row
      style={{
        minHeight: "200px",
        pointerEvents: access?.readonly ? "none" : "auto",
      }}
      title={name}
      className="overflow-auto"
    >
      {children}
    </Row>
  );
};
