// app/api/tables/[model]/route.ts
import prisma from "@/app/libs/prisma";
import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────
type FilterItem = { field: string; operator: string; value: any };

// ─── GET Handler ──────────────────────────────────────────────────────────────
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
    return NextResponse.json({ error: error.message || "Query failed" }, { status: 400 });
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
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function convertValueForPrisma(value: any, type: string): any {
  if (value == null) return value;

  switch (type) {
    case "number":
      return Number(value);
    case "boolean":
      // 👇 Forzar conversión de string a boolean
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

  // Si no tiene punto, asumir que es el nombre de la relación y buscar por name
  return {
    [field]: {
      some: { name: { contains: String(value), mode: "insensitive" } },
    },
  };
}

function buildCondition(field: string, operator: string, value: any, type: string): any {
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

function buildWhereClause(filters: FilterItem[], columnTypes: Record<string, string>): any {
  if (!filters.length) return {};

  const conditions = filters.map(({ field, operator, value }) => {
    const type = columnTypes[field] || "string";
    const convertedValue = convertValueForPrisma(value, type);
    return buildCondition(field, operator, convertedValue, type);
  });

  return { AND: conditions };
}
