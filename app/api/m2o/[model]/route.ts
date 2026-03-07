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

function domainItemToWhere(item: DomainItem) {
  const [field, operator, value] = item;

  if (!field || !operator || !isSafeKey(field)) return null;

  const path = splitPath(field);
  if (path.length === 0) return null;

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

function parseDomain(raw: string | null): DomainItem[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item) => {
      return (
        Array.isArray(item) &&
        item.length === 3 &&
        typeof item[0] === "string" &&
        typeof item[1] === "string"
      );
    }) as DomainItem[];
  } catch {
    return [];
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ model: string }> },
) {
  const { model } = await context.params;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const search = searchParams.get("search") ?? "";
  const limit = Math.min(
    50,
    Math.max(1, Number(searchParams.get("limit") ?? 8)),
  );
  const domain = parseDomain(searchParams.get("domain"));

  const modelDelegate = (prisma as any)[model];

  if (!modelDelegate) {
    return NextResponse.json(
      { error: "Model not found in Prisma" },
      { status: 400 },
    );
  }

  const domainWhere = domain.map(domainItemToWhere).filter(Boolean);

  if (id) {
    const record = await modelDelegate.findFirst({
      where: {
        AND: [{ id: String(id) }, ...domainWhere],
      },
      select: { id: true, name: true },
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
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(
    results.map((r: any) => ({
      id: r.id,
      name: r.name,
    })),
  );
}
