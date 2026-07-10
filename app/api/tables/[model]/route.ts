// app/api/tables/[model]/route.ts
import prisma from "@/app/libs/prisma";
import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────
type FilterItem = { field: string; operator: string; value: any };

// ─── GET Handler ──────────────────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ model: string }> },
) {
  try {
    const { model } = await context.params;
    const { searchParams } = new URL(req.url);

    // Validar modelo
    if (!model || !(model in prisma)) {
      return NextResponse.json({ error: "Invalid model" }, { status: 400 });
    }

    const modelDelegate = (prisma as any)[model];

    // Parsear parámetros
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.min(200, Number(searchParams.get("pageSize") || 20));
    const sort = parseSort(searchParams.get("sort"));
    const filters = parseJSON(searchParams.get("filters"), []);
    const domain = parseJSON(searchParams.get("domain"), []);
    const columnTypes = parseJSON(searchParams.get("columnTypes"), {});
    const includes = parseJSON(searchParams.get("includes"), {});

    // Combinar domain + filters
    const allFilters = [
      ...domain.map(([field, operator, value]: any[]) => ({
        field,
        operator,
        value,
      })),
      ...filters,
    ];

    // Construir where
    const where = buildWhereClause(allFilters, columnTypes);

    console.log();

    // Ejecutar queries
    const [total, rows] = await Promise.all([
      modelDelegate.count({ where }),
      modelDelegate.findMany({
        where,
        orderBy: sort, // Ya viene en formato Prisma correcto
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: Object.keys(includes).length > 0 ? includes : undefined,
      }),
    ]);

    return NextResponse.json({ rows, total, page, pageSize });
  } catch (error: any) {
    console.error("Table API Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Query failed" },
      { status: 400 },
    );
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseSort(raw: string | null): any {
  try {
    const parsed = JSON.parse(raw || '{"id":"asc"}');

    // Si ya viene en formato Prisma ({ Group: { name: "asc" } }), usarlo directo
    if (!parsed.field) return parsed;

    // Si viene en formato { field: "Group.name", dir: "asc" }, convertirlo
    if (parsed.field.includes(".")) {
      const [relation, ...path] = parsed.field.split(".");
      return { [relation]: { [path.join(".")]: parsed.dir } };
    }

    return { [parsed.field]: parsed.dir };
  } catch {
    return { id: "asc" };
  }
}

function parseJSON<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);

    // Si el resultado es un string que parece un objeto, intentar parsearlo de nuevo
    if (typeof parsed === "string" && parsed.startsWith("{")) {
      try {
        return JSON.parse(parsed);
      } catch {
        return parsed as T;
      }
    }

    return parsed;
  } catch {
    return fallback;
  }
}

function convertValueForPrisma(value: any, type: string): any {
  // 🔥 Si es null/undefined, devolverlo tal cual
  if (value == null) return value;

  // Si es array, convertir cada elemento
  if (Array.isArray(value)) {
    return value.map((v) => convertValueForPrisma(v, type));
  }

  // Si es un objeto, no convertirlo (es para relaciones)
  if (typeof value === "object") {
    return value;
  }

  switch (type) {
    case "number":
      return Number(value);
    case "boolean":
      if (typeof value === "string") {
        return value === "true" || value === "1";
      }
      return Boolean(value);
    case "date":
    case "datetime":
      return new Date(value);
    case "relation":
      return value;
    default:
      return String(value);
  }
}

function buildOperatorCondition(
  operator: string,
  value: any,
  type: string,
): any {
  const isString = type === "string" || type === "relation";
  const isArray = Array.isArray(value);

  switch (operator) {
    case "=":
      return value;
    case "!=":
      return { not: value };
    case ">":
      return { gt: value };
    case ">=":
      return { gte: value };
    case "<":
      return { lt: value };
    case "<=":
      return { lte: value };
    case "contains":
      return isString ? { contains: value, mode: "insensitive" } : value;
    case "startsWith":
      return isString ? { startsWith: value, mode: "insensitive" } : value;
    case "endsWith":
      return isString ? { endsWith: value, mode: "insensitive" } : value;
    case "in":
      if (!isArray) {
        console.warn(`Operator 'in' expects array, got ${typeof value}`);
        return { in: [value] };
      }
      return { in: value };
    case "notIn":
      if (!isArray) {
        console.warn(`Operator 'notIn' expects array, got ${typeof value}`);
        return { notIn: [value] };
      }
      return { notIn: value };
    case "some":
      return { some: value };
    case "every":
      return { every: value };
    case "none":
      return { none: value };
    default:
      return value;
  }
}

function buildRelationCondition(
  field: string,
  operator: string,
  value: any,
): any {
  // Si value es un string que parece objeto/array, parsearlo
  if (typeof value === "string") {
    if ((value.startsWith("{") || value.startsWith("[")) && value.length > 2) {
      try {
        value = JSON.parse(value);
      } catch (e) {
        // Si falla, mantener el string
      }
    }
  }

  const isArray = Array.isArray(value);
  const isObject = typeof value === "object" && value !== null && !isArray;

  // Si el campo tiene punto (ej: "Partner.name")
  if (field.includes(".")) {
    const [relation, ...path] = field.split(".");
    const fieldName = path.join(".");

    switch (operator) {
      case "contains":
        return {
          [relation]: {
            some: {
              [fieldName]: { contains: String(value), mode: "insensitive" },
            },
          },
        };
      case "in":
        if (!isArray) {
          return {
            [relation]: {
              some: { [fieldName]: value },
            },
          };
        }
        return {
          [relation]: {
            some: { [fieldName]: { in: value } },
          },
        };
      case "notIn":
        if (!isArray) {
          return {
            [relation]: {
              none: { [fieldName]: value },
            },
          };
        }
        return {
          [relation]: {
            none: { [fieldName]: { in: value } },
          },
        };
      case "=":
        return {
          [relation]: {
            some: { [fieldName]: value },
          },
        };
      case "!=":
        return {
          [relation]: {
            none: { [fieldName]: value },
          },
        };
      default:
        return {
          [relation]: {
            some: { [fieldName]: { [operator]: value } },
          },
        };
    }
  }

  // 🔥 CASO: field es solo el nombre de la relación (ej: "accessRecords")
  switch (operator) {
    case "some":
      if (isObject) {
        if (Object.keys(value).length === 0) return {};
        return { [field]: { some: value } };
      }
      if (isArray) {
        return {
          [field]: {
            some: { id: { in: value } },
          },
        };
      }
      if (value !== null && value !== undefined) {
        return {
          [field]: {
            some: { id: value },
          },
        };
      }
      return {};

    case "every":
      if (isObject) {
        return { [field]: { every: value } };
      }
      if (isArray) {
        return {
          [field]: {
            every: { id: { in: value } },
          },
        };
      }
      return {
        [field]: {
          every: { id: value },
        },
      };

    case "none":
      if (isObject) {
        return { [field]: { none: value } };
      }
      if (isArray) {
        return {
          [field]: {
            none: { id: { in: value } },
          },
        };
      }
      return {
        [field]: {
          none: { id: value },
        },
      };

    case "=":
      if (isObject) {
        return { [field]: { some: value } };
      }
      if (isArray) {
        return {
          [field]: {
            some: { id: { in: value } },
          },
        };
      }
      return {
        [field]: {
          some: { id: value },
        },
      };

    case "!=":
      if (isObject) {
        return { [field]: { none: value } };
      }
      if (isArray) {
        return {
          [field]: {
            none: { id: { in: value } },
          },
        };
      }
      return {
        [field]: {
          none: { id: value },
        },
      };

    case "in":
      if (!isArray) {
        return {
          [field]: {
            some: { id: { in: [value] } },
          },
        };
      }
      return {
        [field]: {
          some: { id: { in: value } },
        },
      };

    case "notIn":
      if (!isArray) {
        return {
          [field]: {
            none: { id: { in: [value] } },
          },
        };
      }
      return {
        [field]: {
          none: { id: { in: value } },
        },
      };

    default:
      if (isObject) {
        return { [field]: { some: value } };
      }
      if (value !== null && value !== undefined) {
        return {
          [field]: {
            some: { name: { [operator]: String(value), mode: "insensitive" } },
          },
        };
      }
      return {};
  }
}

function buildCondition(
  field: string,
  operator: string,
  value: any,
  type: string,
): any {
  // Si el valor es un objeto complejo (para relaciones)
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    if (type === "relation") {
      return buildRelationCondition(field, operator, value);
    }
    // Para campos normales, pasar el objeto directamente
    return { [field]: value };
  }

  // Si es tipo relación, manejar diferente
  if (type === "relation") {
    return buildRelationCondition(field, operator, value);
  }

  const condition = buildOperatorCondition(operator, value, type);

  // Campos anidados (ej: "Partner.name")
  if (field.includes(".")) {
    const [relation, ...path] = field.split(".");
    return { [relation]: { [path.join(".")]: condition } };
  }

  return { [field]: condition };
}

// app/api/tables/[model]/route.ts

function buildWhereClause(
  filters: any[],
  columnTypes: Record<string, string>,
): any {
  if (!filters || !filters.length) return {};

  const conditions = filters
    .map((filter) => {
      // 🔥 Operadores lógicos: ["OR", [...]] o ["AND", [...]]
      if (Array.isArray(filter) && filter.length === 2) {
        const [operator, operands] = filter;
        if (operator === "OR" || operator === "AND") {
          const nested = buildWhereClause(operands, columnTypes);

          // Si nested ya tiene AND/OR, extraerlo
          if (nested.AND) {
            return { [operator]: nested.AND };
          }
          if (nested.OR) {
            return { [operator]: nested.OR };
          }

          // Si es un array de condiciones
          if (Array.isArray(nested)) {
            return { [operator]: nested };
          }

          // Si es una condición simple
          return { [operator]: [nested] };
        }
      }

      // 🔥 Condición simple: ["field", "operator", "value"]
      if (Array.isArray(filter) && filter.length === 3) {
        const [field, operator, value] = filter;
        const type = columnTypes[field] || "string";
        const convertedValue = convertValueForPrisma(value, type);

        if (operator === "in" || operator === "notIn") {
          return buildCondition(field, operator, value, type);
        }
        return buildCondition(field, operator, convertedValue, type);
      }

      return null;
    })
    .filter((cond) => cond !== null);

  if (!conditions.length) return {};
  if (conditions.length === 1) return conditions[0];

  return { AND: conditions };
}
