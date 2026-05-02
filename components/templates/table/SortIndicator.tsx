// components/SortIndicator.tsx
import React from "react";

interface SortIndicatorProps {
  active: boolean;
  direction: "asc" | "desc";
}

export function SortIndicator({ active, direction }: SortIndicatorProps) {
  if (!active) {
    return (
      <i
        className="bi bi-arrow-down-up text-muted"
        style={{ fontSize: "0.75rem", opacity: 0.3 }}
      />
    );
  }

  return (
    <i
      className={`bi bi-arrow-${direction === "asc" ? "up" : "down"} text-primary`}
      style={{ fontSize: "0.75rem" }}
    />
  );
}
