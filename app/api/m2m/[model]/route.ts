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
  | "<=";

type DomainItem = [field: string, operator: DomainOperator, value: any];

const SAFE_KEY_REGEX = /^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)*$/;
const MAX_PATH_DEPTH = 4;

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

function parseDomain(raw: string | null): DomainItem[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) =>
        Array.isArray(item) &&
        item.length === 3 &&
        typeof item[0] === "string" &&
        typeof item[1] === "string",
    ) as DomainItem[];
  } catch {
    return [];
  }
}

function domainItemToWhere(item: DomainItem) {
  const [field, operator, value] = item;

  if (!field || !operator || !isSafeKey(field)) return null;

  const path = splitPath(field);
  if (!path.length || path.length > MAX_PATH_DEPTH) return null;

  switch (operator) {
    case "=":
      return buildNestedWhere(path, value);
    case "!=":
      return buildNestedWhere(path, { not: value });
    case "contains":
      return buildNestedWhere(path, {
        contains: String(value ?? ""),
        mode: "insensitive",
      });
    case "startsWith":
      return buildNestedWhere(path, {
        startsWith: String(value ?? ""),
        mode: "insensitive",
      });
    case "endsWith":
      return buildNestedWhere(path, {
        endsWith: String(value ?? ""),
        mode: "insensitive",
      });
    case "in":
      return buildNestedWhere(path, {
        in: Array.isArray(value) ? value : [value],
      });
    case "notIn":
      return buildNestedWhere(path, {
        notIn: Array.isArray(value) ? value : [value],
      });
    case ">":
      return buildNestedWhere(path, { gt: value });
    case ">=":
      return buildNestedWhere(path, { gte: value });
    case "<":
      return buildNestedWhere(path, { lt: value });
    case "<=":
      return buildNestedWhere(path, { lte: value });
    default:
      return null;
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ model: string }> },
) {
  const { model } = await context.params;
  const { searchParams } = new URL(req.url);

  const idsParam = searchParams.get("ids");
  const excludeIdsParam = searchParams.get("excludeIds");
  const search = searchParams.get("search") ?? "";
  const limit = Math.min(
    50,
    Math.max(1, Number(searchParams.get("limit") ?? 10)),
  );
  const domain = parseDomain(searchParams.get("domain"));

  const modelDelegate = (prisma as any)[model];

  if (!modelDelegate) {
    return NextResponse.json(
      { error: "Model not found in Prisma" },
      { status: 400 },
    );
  }

  const domainWhere = domain.map(domainItemToWhere).filter(Boolean) as any[];

  if (idsParam) {
    const ids = idsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json([]);
    }

    const results = await modelDelegate.findMany({
      where: {
        AND: [{ id: { in: ids } }, ...domainWhere],
      },
      select: {
        id: true,
        name: true,
      },
    });

    const sorted = ids
      .map((id) => results.find((r: any) => r.id === id))
      .filter(Boolean);

    return NextResponse.json(sorted);
  }

  const excludeIds = (excludeIdsParam ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const andWhere: any[] = [...domainWhere];

  if (search.trim()) {
    andWhere.push({
      OR: [{ name: { contains: search, mode: "insensitive" } }],
    });
  }

  if (excludeIds.length > 0) {
    andWhere.push({
      id: { notIn: excludeIds },
    });
  }

  const results = await modelDelegate.findMany({
    where: andWhere.length ? { AND: andWhere } : undefined,
    take: limit,
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(results);
}
