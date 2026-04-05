"use client";

import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";

type DropItem = {
  id: string | number;
  name: string;
}[];

export function WidgetDropList({ items }: { items: DropItem }) {
  const renderTooltip = (props: any) => (
    <Tooltip {...props} className="text-start">
      {items.map((it, i) => (
        <div key={it.id + String(i)}>{it.name}</div>
      ))}
    </Tooltip>
  );

  return (
    <OverlayTrigger
      placement="right"
      delay={{ show: 250, hide: 400 }}
      overlay={renderTooltip}
    >
      <Button variant="none" size="sm">
        {items.length < 2 ? items[0]?.name : items.length + " Registros"}
      </Button>
    </OverlayTrigger>
  );
}
