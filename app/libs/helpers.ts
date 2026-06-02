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

export const formatCurrency = ({
  value,
  currency = "MXN",
}: {
  value: number;
  currency?: string;
}) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency,
  }).format(value);
};

export function generateModelCode(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "";
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0][0] + words[1][0]).toUpperCase();
}

// helpers/numberFormat.ts

/**
 * Formatea un número para visualización
 * @example formatNumberForDisplay(1234.5, 2, true) // "1,234.50"
 */
export function formatNumberForDisplay(
  value: number | null | undefined,
  decimals: number = 2,
  useThousandsSeparator: boolean = true, // 👈 Cambiar default a true
): string {
  if (value === null || value === undefined || isNaN(value)) return "";

  if (!useThousandsSeparator) {
    return value.toFixed(decimals);
  }

  // Formato mexicano: separador de miles = coma
  return value.toLocaleString("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true, // Esto pone las comas como separador de miles
  });
}

/**
 * Parsea un string formateado a número
 * @example parseNumberFromDisplay("1,234.50") // 1234.5
 */
export function parseNumberFromDisplay(value: string): number {
  if (!value || value === "") return 0;

  // Para formato mexicano: 1,234,567.89
  // 1. Quitar todas las comas (separadores de miles)
  // 2. Dejar el punto como separador decimal
  const cleanValue = value.replace(/,/g, ""); // Solo quita comas

  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Redondea a N decimales
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  // const factor = Math.pow(10, decimals);
  return Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals);
}

export const serverLog = ({
  action,
  model,
  data,
}: {
  action: "Fetching" | "Creating" | "Updating" | "Deleting";
  model: string;
  data: object | null;
}) => {
  const output = `${action} ${model}: ${JSON.stringify(data)}`;
  return console.log(output);
};
