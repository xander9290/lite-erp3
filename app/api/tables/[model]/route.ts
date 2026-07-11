// app/api/tables/[model]/route.ts

import prisma from "@/app/libs/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ model: string }> }) {
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
    const filters = parseFilters(searchParams.get("filters"));
    const domain = parseDomain(searchParams.get("domain")); // 🔥 Ahora maneja operadores lógicos
    const columnTypes = parseJSON(searchParams.get("columnTypes"), {});
    const includes = parseJSON(searchParams.get("includes"), {});

    // 🔥 Combinar domain + filters correctamente
    // domain ya viene como array de condiciones con soporte para OR/AND
    // filters también viene como array de condiciones
    const allFilters = [...domain, ...filters];

    // Construir where
    const where = buildWhereClause(allFilters, columnTypes);

    // Ejecutar queries
    const [total, rows] = await Promise.all([
      modelDelegate.count({ where }),
      modelDelegate.findMany({
        where,
        orderBy: sort,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: Object.keys(includes).length > 0 ? includes : undefined,
      }),
    ]);

    return NextResponse.json({ rows, total, page, pageSize });
  } catch (error: any) {
    console.error("Table API Error:", error.message);
    return NextResponse.json({ error: error.message || "Query failed" }, { status: 400 });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// 🔥 Función mejorada para parsear domain
function parseDomain(raw: string | null): any[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    // Si es un array, procesarlo recursivamente
    if (Array.isArray(parsed)) {
      return processFilterArray(parsed);
    }

    return [];
  } catch (e) {
    console.warn("Failed to parse domain:", raw, e);
    return [];
  }
}

// 🔥 Función mejorada para parsear filters
function parseFilters(raw: string | null): any[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    // Si es un array, procesarlo recursivamente
    if (Array.isArray(parsed)) {
      return processFilterArray(parsed);
    }

    // Si es un objeto con field, operator, value
    if (typeof parsed === "object" && parsed !== null && parsed.field && parsed.operator) {
      return [parsed];
    }

    return [];
  } catch (e) {
    console.warn("Failed to parse filters:", raw, e);
    return [];
  }
}

// 🔥 Función para procesar arrays de filtros recursivamente
function processFilterArray(arr: any[]): any[] {
  return arr.map((item) => {
    // Si es un array de 2 elementos y el primero es OR/AND
    if (Array.isArray(item) && item.length === 2 && (item[0] === "OR" || item[0] === "AND")) {
      const [operator, operands] = item;
      // Procesar los operandos recursivamente
      if (Array.isArray(operands)) {
        return [operator, processFilterArray(operands)];
      }
      return item;
    }

    // Si es un array de 3 elementos (field, operator, value)
    if (Array.isArray(item) && item.length === 3) {
      return item;
    }

    // Si es un objeto con field, operator, value
    if (typeof item === "object" && item !== null && item.field && item.operator) {
      return [item.field, item.operator, item.value];
    }

    return item;
  });
}

function parseSort(raw: string | null): any {
  try {
    const parsed = JSON.parse(raw || '{"id":"asc"}');
    if (!parsed.field) return parsed;
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

    if (typeof parsed === "string" && (parsed.startsWith("{") || parsed.startsWith("["))) {
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
  if (value == null) return value;
  if (Array.isArray(value)) {
    return value.map((v) => convertValueForPrisma(v, type));
  }
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

function buildOperatorCondition(operator: string, value: any, type: string): any {
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

function buildRelationCondition(field: string, operator: string, value: any): any {
  if (typeof value === "string") {
    if ((value.startsWith("{") || value.startsWith("[")) && value.length > 2) {
      try {
        value = JSON.parse(value);
      } catch (e) {
        // Si falla, mantener el string
        console.log(e);
      }
    }
  }

  const isArray = Array.isArray(value);
  const isObject = typeof value === "object" && value !== null && !isArray;

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

  // Campos de relación sin punto
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

function buildCondition(field: string, operator: string, value: any, type: string): any {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    if (type === "relation") {
      return buildRelationCondition(field, operator, value);
    }
    return { [field]: value };
  }

  if (type === "relation") {
    return buildRelationCondition(field, operator, value);
  }

  const condition = buildOperatorCondition(operator, value, type);

  if (field.includes(".")) {
    const [relation, ...path] = field.split(".");
    return { [relation]: { [path.join(".")]: condition } };
  }

  return { [field]: condition };
}

// 🔥 Función mejorada para construir where con soporte para OR/AND
function buildWhereClause(filters: any[], columnTypes: Record<string, string>): any {
  if (!filters || !filters.length) return {};

  const conditions = filters
    .map((filter) => {
      // 🔥 CASO 1: Operador lógico: ["OR", [...]] o ["AND", [...]]
      if (Array.isArray(filter) && filter.length === 2) {
        const [operator, operands] = filter;

        if (operator === "OR" || operator === "AND") {
          if (!Array.isArray(operands)) {
            console.warn(`Operador ${operator} requiere un array de condiciones`);
            return null;
          }

          // Construir condiciones anidadas
          const nestedConditions = buildWhereClause(operands, columnTypes);

          if (!nestedConditions || Object.keys(nestedConditions).length === 0) {
            return null;
          }

          // Extraer condiciones del objeto resultante
          let conditionsArray: any[] = [];

          if (nestedConditions.AND) {
            conditionsArray = Array.isArray(nestedConditions.AND) ? nestedConditions.AND : [nestedConditions.AND];
          } else if (nestedConditions.OR) {
            conditionsArray = Array.isArray(nestedConditions.OR) ? nestedConditions.OR : [nestedConditions.OR];
          } else if (Array.isArray(nestedConditions)) {
            conditionsArray = nestedConditions;
          } else {
            conditionsArray = [nestedConditions];
          }

          return { [operator]: conditionsArray };
        }
      }

      // 🔥 CASO 2: Condición simple como array: ["field", "operator", "value"]
      if (Array.isArray(filter) && filter.length === 3) {
        const [field, operator, value] = filter;
        const type = columnTypes[field] || "string";
        const convertedValue = convertValueForPrisma(value, type);

        if (operator === "in" || operator === "notIn") {
          return buildCondition(field, operator, value, type);
        }
        return buildCondition(field, operator, convertedValue, type);
      }

      // 🔥 CASO 3: Condición como objeto: { field, operator, value }
      if (typeof filter === "object" && filter !== null && filter.field && filter.operator) {
        const { field, operator, value } = filter;
        const type = columnTypes[field] || "string";
        const convertedValue = convertValueForPrisma(value, type);
        return buildCondition(field, operator, convertedValue, type);
      }

      console.warn("Filtro no reconocido:", filter);
      return null;
    })
    .filter((cond) => cond !== null && Object.keys(cond).length > 0);

  if (!conditions.length) return {};
  if (conditions.length === 1) return conditions[0];

  return { AND: conditions };
}
