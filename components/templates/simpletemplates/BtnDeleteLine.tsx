"use client";

import { Button } from "react-bootstrap";

export function BtnDeleteLine({ action, disabled }: { action: () => void; disabled?: boolean }) {
  return (
    <Button variant="link" onClick={action} disabled={disabled}>
      <i className="bi bi-trash"></i>
    </Button>
  );
}
