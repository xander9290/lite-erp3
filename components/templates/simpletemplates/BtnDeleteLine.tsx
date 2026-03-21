"use client";

import { Button } from "react-bootstrap";

export function BtnDeleteLine({ action }: { action: () => void }) {
  return (
    <Button variant="link" size="sm" onClick={action}>
      <i className="bi bi-trash"></i>
    </Button>
  );
}
