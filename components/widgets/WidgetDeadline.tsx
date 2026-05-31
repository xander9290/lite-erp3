"use client";

import { differenceInCalendarDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "react-bootstrap";

interface WidgetDeadlineProps {
  date: Date | null;
  warnAfter?: number;
}

export function WidgetDeadline({ date, warnAfter = 15 }: WidgetDeadlineProps) {
  if (!date) return null;

  // ✅ Convertir a Date si no lo es ya
  const dateObj = date instanceof Date ? date : new Date(date);

  // Verificar que sea una fecha válida
  if (isNaN(dateObj.getTime())) return null;

  // ✅ Formatear la fecha sin desfase de zona horaria
  const day = dateObj.getUTCDate();
  const month = dateObj.getUTCMonth();
  const year = dateObj.getUTCFullYear();
  const localDate = new Date(year, month, day, 12); // Mediodía para evitar ambigüedades

  // ✅ Crear "hoy" en UTC para comparar manzanas con manzanas
  const now = new Date();
  const todayUTC = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      12, // Mediodía UTC
    ),
  );

  // ✅ Comparar fechas en el mismo "plano" (ambas a mediodía UTC)
  const daysLeft = differenceInCalendarDays(localDate, todayUTC);

  const bg = daysLeft <= 0 ? "danger" : daysLeft <= warnAfter ? "warning" : "success";

  const label = daysLeft < 0 ? `Vencido ${Math.abs(daysLeft)}d` : daysLeft === 0 ? "Hoy" : `${daysLeft}d`;

  // ✅ Determinar formato según si es el mismo año o no
  const currentYear = now.getUTCFullYear();
  const dateFormat = year === currentYear ? "dd MMM" : "dd MMM yyyy";

  return (
    <div className="text-center">
      <span className="me-2">{format(localDate, dateFormat, { locale: es })}</span>

      <Badge bg={bg}>{label}</Badge>
    </div>
  );
}
