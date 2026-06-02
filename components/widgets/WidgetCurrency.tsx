"use client";

import { formatCurrency } from "@/app/libs/helpers";

export function WidgetCurrency({ number, currency = "MXN" }: { number: number; currency?: string }) {
  return (
    <div className="text-end fw-bold">
      <p className="p-0 m-0 fs-6">{formatCurrency({ value: number, currency })}</p>
    </div>
  );
}
