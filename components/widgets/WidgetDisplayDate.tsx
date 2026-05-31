"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";

export function WidgetDisplayDate({ date }: { date: Date | null }) {
  if (!date) return null;

  // Extraer componentes en UTC para que no se desfase
  const utcDate = new Date(date);
  const day = utcDate.getUTCDate();
  const month = utcDate.getUTCMonth();
  const year = utcDate.getUTCFullYear();

  // Reconstruir una fecha "local" pero con los valores UTC
  const localDate = new Date(year, month, day);

  return <div className="text-center">{format(localDate, "dd MMM yyyy", { locale: es })}</div>;
}
