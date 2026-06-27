import prisma from "@/app/libs/prisma";
import { NextRequest, NextResponse } from "next/server";

type DomainOperator =
  | "="
  | "!="
  | "contains"
  | "startsWith"
  | "endsWith"
  | "in"
  | "notIn"
  | ">"
  | ">="
  | "<"
  | "<="
  | "some" // Para relaciones "some"
  | "every" // Para relaciones "every"
  | "none"; // Para relaciones "none"

// El valor ahora puede ser un objeto con condiciones anidadas
type DomainItem = [field: string, operator: DomainOperator, value: any];

const SAFE_KEY_REGEX = /^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)*$/;

function isSafeKey(key: string) {
  return SAFE_KEY_REGEX.test(key);
}

function splitPath(key: string) {
  return key
    .split(".")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildNestedWhere(path: string[], leafCondition: any) {
  return path.reduceRight((acc, part, idx) => {
    if (idx === path.length - 1) return { [part]: leafCondition };
    return { [part]: acc };
  }, {});
}

// Función auxiliar para obtener la condición según el operador
function getConditionForOperator(operator: DomainOperator, value: any) {
  switch (operator) {
    case "=":
      return value;
    case "!=":
      return { not: value };
    case "contains":
      return {
        contains: String(value ?? ""),
        mode: "insensitive",
      };
    case "startsWith":
      return {
        startsWith: String(value ?? ""),
        mode: "insensitive",
      };
    case "endsWith":
      return {
        endsWith: String(value ?? ""),
        mode: "insensitive",
      };
    case "in":
      return {
        in: Array.isArray(value) ? value : [value],
      };
    case "notIn":
      return {
        notIn: Array.isArray(value) ? value : [value],
      };
    case ">":
      return { gt: value };
    case ">=":
      return { gte: value };
    case "<":
      return { lt: value };
    case "<=":
      return { lte: value };
    default:
      return value;
  }
}

// Nueva función para construir condiciones de relación con operadores like "some"
function buildRelationWhere(path: string[], operator: DomainOperator, value: any) {
  // Extraemos el último elemento del path (el campo final)
  const lastPart = path[path.length - 1];
  const relationPath = path.slice(0, -1); // El resto del path es la relación

  // Construimos la condición para el campo final
  let fieldCondition: any;

  switch (operator) {
    case "some":
    case "every":
    case "none":
      // Para estos operadores, el valor puede ser un objeto con condiciones
      if (typeof value === "object" && !Array.isArray(value)) {
        // Si el valor es un objeto, lo usamos directamente como condiciones
        fieldCondition = value;
      } else {
        // Si es un valor simple, lo tratamos como una igualdad
        fieldCondition = { [lastPart]: value };
      }

      // Construimos la condición de relación
      return relationPath.reduceRight((acc, part, idx) => {
        if (idx === relationPath.length - 1) {
          return {
            [part]: {
              [operator]: fieldCondition,
            },
          };
        }
        return { [part]: acc };
      }, {});

    default:
      // Para operadores normales, construimos el where normal
      return buildNestedWhere(path, getConditionForOperator(operator, value));
  }
}

function domainItemToWhere(item: DomainItem) {
  const [field, operator, value] = item;

  if (!field || !operator || !isSafeKey(field)) return null;

  const path = splitPath(field);
  if (path.length === 0) return null;

  // Si el operador es de relación (some, every, none)
  if (["some", "every", "none"].includes(operator)) {
    return buildRelationWhere(path, operator, value);
  }

  // Para operadores normales
  const condition = getConditionForOperator(operator, value);
  return buildNestedWhere(path, condition);
}

function parseDomain(raw: string | null): DomainItem[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item) => {
      return Array.isArray(item) && item.length === 3 && typeof item[0] === "string" && typeof item[1] === "string";
    }) as DomainItem[];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ model: string }> }) {
  const { model } = await context.params;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const search = searchParams.get("search") ?? "";
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 8)));
  const domain = parseDomain(searchParams.get("domain"));

  const modelDelegate = (prisma as any)[model];

  if (!modelDelegate) {
    return NextResponse.json({ error: "Model not found in Prisma" }, { status: 400 });
  }

  const domainWhere = domain.map(domainItemToWhere).filter(Boolean);

  if (id) {
    const record = await modelDelegate.findFirst({
      where: {
        AND: [{ id: String(id) }, ...domainWhere],
      },
    });

    return NextResponse.json(record);
  }

  const searchWhere = search.trim()
    ? {
        OR: [{ name: { contains: search, mode: "insensitive" } }],
      }
    : undefined;

  const where = {
    AND: [...(searchWhere ? [searchWhere] : []), ...domainWhere],
  };

  const results = await modelDelegate.findMany({
    where,
    take: limit,
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(results);
}
