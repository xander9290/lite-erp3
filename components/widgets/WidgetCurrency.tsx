"use client";

import { formatCurrency } from "@/app/libs/helpers";

export function WidgetCurrency({ number, currency = "MXN" }: { number: number; currency?: string }) {
  return <div className="text-end fw-semibold">{formatCurrency({ value: number, currency })}</div>;
}
