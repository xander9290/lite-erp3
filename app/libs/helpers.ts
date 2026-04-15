import { isAfter, isBefore, isEqual } from "date-fns";

export const hourClock = (): string => {
  const time = new Date();
  return time.toLocaleString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDate = (date: Date | string | number | null) => {
  if (!date || date === "") return null;
  const d = new Date(date);
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

export const parserDate = (date: Date | string) => {
  return new Date(date).toISOString().slice(0, 16) || new Date();
};

export const toDatetimeLocal = (date: Date | null) => {
  if (!date) return null;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
};

export function round(value: number, decimals: number) {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

type CompareOperator = ">" | ">=" | "<" | "<=" | "==" | "===" | "!=" | "!==";

export function compareDates(
  date1: Date | string,
  operator: CompareOperator,
  date2: Date | string,
  compareTime: boolean = true,
): boolean {
  let d1 = new Date(date1);
  let d2 = new Date(date2);

  // Si NO se comparan horas → normalizar ambas fechas a medianoche
  if (!compareTime) {
    d1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    d2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  }

  switch (operator) {
    case ">":
      return isAfter(d1, d2);

    case ">=":
      return isAfter(d1, d2) || isEqual(d1, d2);

    case "<":
      return isBefore(d1, d2);

    case "<=":
      return isBefore(d1, d2) || isEqual(d1, d2);

    case "==":
    case "===":
      return isEqual(d1, d2);

    case "!=":
    case "!==":
      return !isEqual(d1, d2);

    default:
      throw new Error(`Operador no válido: ${operator}`);
  }
}

export function esMultiplo(cant: number, uom: number) {
  const precision = 1e-9;
  return Math.abs(cant % uom) < precision;
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
};

export function generateModelCode(string: string) {
  // CONSTRUYE EL CÓDIGO PREFIJO PARA EL ALMACÉN A PARTIR DEL NOMBRE DE LA NUEVA EMPRESA
  let newCode = "";

  const stringArray = string.split(" ");
  const firstLetter = stringArray[0].slice(0, 1);
  const secondLetter =
    stringArray.length > 1
      ? stringArray[1].slice(0, 1)
      : stringArray[0].slice(1, 2);

  newCode = firstLetter + secondLetter;

  return newCode;
}
