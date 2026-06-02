"use client";

import { differenceInCalendarDays, differenceInMonths, format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "react-bootstrap";

interface WidgetDeadlineProps {
  date: Date | null;
  warnAfter?: number; // en días
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
  const localDate = new Date(year, month, day, 12);

  // ✅ Crear "hoy" en UTC para comparar
  const now = new Date();

  // ✅ Calcular diferencias
  const daysLeft = differenceInCalendarDays(localDate, now);
  const monthsLeft = differenceInMonths(localDate, now);
  const yearsLeft = Math.floor(monthsLeft / 12);

  // ✅ Determinar el texto y color
  let label = "";
  let bg = "success";

  if (daysLeft < 0) {
    // Vencido
    const absDays = Math.abs(daysLeft);
    label = `Vencido ${absDays}d`;
    bg = "danger";
  } else if (daysLeft === 0) {
    label = "Hoy";
    bg = "warning";
  } else if (daysLeft > 30) {
    // Más de 30 días - mostrar meses o años
    if (yearsLeft > 0) {
      const remainingMonths = monthsLeft % 12;
      if (remainingMonths === 0) {
        label = `${yearsLeft}a`;
      } else {
        label = `${yearsLeft}a ${remainingMonths}m`;
      }
    } else {
      label = `${monthsLeft}m`;
    }

    // ⚠️ warnAfter es en días, convertimos a meses para la comparación
    // Si warnAfter=15 días, significa que queremos mostrar warning cuando falten <=15 días
    // Pero si estamos mostrando meses, significa que faltan >30 días, entonces es "success"
    // (a menos que warnAfter sea mayor a 30 días)
    if (warnAfter > 30) {
      const monthsWarning = Math.ceil(warnAfter / 30);
      bg = monthsLeft <= monthsWarning ? "warning" : "success";
    } else {
      // Si warnAfter <= 30, cuando mostramos meses (>30 días) siempre es success
      bg = "success";
    }
  } else {
    // 1-30 días
    label = `${daysLeft}d`;
    bg = daysLeft <= warnAfter ? "warning" : "success";
  }

  // ✅ Determinar formato de fecha
  const currentYear = now.getUTCFullYear();
  const dateFormat = year === currentYear ? "dd MMM" : "dd MMM yyyy";

  return (
    <div className="text-center">
      <span className="me-2">
        {format(localDate, dateFormat, { locale: es })}
      </span>
      <Badge bg={bg}>{label}</Badge>
    </div>
  );
}
