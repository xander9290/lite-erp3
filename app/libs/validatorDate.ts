// validators/date.ts

export function toDateTimeLocal(value: string | Date | null | undefined): string {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-` + `${pad(date.getMonth() + 1)}-` + `${pad(date.getDate())}T` + `${pad(date.getHours())}:` + `${pad(date.getMinutes())}`;
}

export function toDateOnly(value: string | Date | null | undefined): string {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

export function todayDate(): string {
  const date = new Date();

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
