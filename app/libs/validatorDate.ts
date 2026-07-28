// validators/date.ts

import { format, parseISO } from "date-fns";

export function toDateTimeLocal(value: Date | string | null | undefined): string {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);

  return isNaN(date.getTime()) ? "" : format(date, "yyyy-MM-dd'T'HH:mm:ss");
}

export function toDateOnly(value: string | Date | null | undefined): string {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) return "";

  return format(parseISO(date.toISOString().replace("Z", "")), "yyyy-MM-dd");

  // return date.toISOString().slice(0, 10);
}

export const todayDate = () => format(new Date(), "yyyy-MM-dd");

export const nowLocal = () => format(new Date(), "yyyy-MM-dd'T'HH:mm");
