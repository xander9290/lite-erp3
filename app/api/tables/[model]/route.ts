import prisma from "@/app/libs/prisma";
import { NextRequest, NextResponse } from "next/server";

type SortDir = "asc" | "desc";

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

const MAX_FIELDS = 60;
const MAX_PATH_DEPTH = 4;

const SENSITIVE_FIELD_DENYLIST = [
  "password",
  "hash",
  "salt",
  "token",
  "refreshToken",
  "accessToken",
  "secret",
  "apiKey",
  "privateKey",
  "twoFactorSecret",
];

type PathPart = {
  key: string;
  isArray: boolean;
};

function splitPath(key: string): PathPart[] {
  return key
    .split(".")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((segment) => {
      const isArray = segment.endsWith("[]");
      return {
        key: isArray ? segment.slice(0, -2) : segment,
        isArray,
      };
    })
    .filter((p) => p.key);
}

function isSafeKey(key: string) {
  return /^[A-Za-z0-9_]+(\[\])?(\.[A-Za-z0-9_]+(\[\])?)*$/.test(key);
}

function containsDeniedSegment(path: PathPart[]) {
  return path.some((seg) =>
    SENSITIVE_FIELD_DENYLIST.some(
      (d) => seg.key.toLowerCase() === d.toLowerCase(),
    ),
  );
}

// function splitPath(key: string) {
//   return key
//     .split(".")
//     .map((s) => s.trim())
//     .filter(Boolean);
// }

// function containsDeniedSegment(path: string[]) {
//   return path.some((seg) =>
//     SENSITIVE_FIELD_DENYLIST.some((d) => seg.toLowerCase() === d.toLowerCase()),
//   );
// }

// function buildSelectFromFieldPaths(fieldPaths: string[][]): any {
//   const select: any = {};

//   for (const path of fieldPaths) {
//     if (!path.length) continue;

//     let cursor = select;

//     for (let i = 0; i < path.length; i++) {
//       const part = path[i];
//       const isLast = i === path.length - 1;

//       if (isLast) {
//         cursor[part] = true;
//       } else {
//         cursor[part] = cursor[part] ?? { select: {} };
//         cursor = cursor[part].select;
//       }
//     }
//   }

//   if (!select.id) select.id = true;

//   return select;
// }

function buildSelectFromFieldPaths(fieldPaths: PathPart[][]): any {
  const select: any = {};

  for (const path of fieldPaths) {
    if (!path.length) continue;

    let cursor = select;

    for (let i = 0; i < path.length; i++) {
      const part = path[i].key;
      const isLast = i === path.length - 1;

      if (isLast) {
        cursor[part] = true;
      } else {
        cursor[part] = cursor[part] ?? { select: {} };
        cursor = cursor[part].select;
      }
    }
  }

  if (!select.id) select.id = true;

  return select;
}

// function buildNestedWhere(path: string[], leafCondition: any) {
//   return path.reduceRight((acc, part, idx) => {
//     if (idx === path.length - 1) return { [part]: leafCondition };
//     return { [part]: acc };
//   }, {});
// }

function buildNestedWhere(path: PathPart[], leafCondition: any): any {
  return path.reduceRight((acc, part, idx) => {
    if (idx === path.length - 1) {
      return { [part.key]: leafCondition };
    }

    if (part.isArray) {
      return { [part.key]: { some: acc } };
    }

    return { [part.key]: acc };
  }, {});
}

// function buildNestedOrderBy(path: string[], dir: SortDir): any {
//   return path.reduceRight((acc, part, idx) => {
//     if (idx === path.length - 1) return { [part]: dir };
//     return { [part]: acc };
//   }, {});
// }

function buildNestedOrderBy(path: PathPart[], dir: SortDir): any {
  const hasArray = path.some((p) => p.isArray);

  if (hasArray) {
    const last = path[path.length - 1];
    if (last?.key === "_count" && path.length >= 2) {
      const rel = path[path.length - 2];
      return { [rel.key]: { _count: dir } };
    }
    return undefined;
  }

  return path.reduceRight((acc, part, idx) => {
    if (idx === path.length - 1) return { [part.key]: dir };
    return { [part.key]: acc };
  }, {});
}

function parseRangeSyntax(raw: string) {
  const f = raw.trim();
  if (!f) return null;

  if (f.includes("..")) {
    const [start, end] = f.split("..").map((v) => v.trim());
    return { op: "between" as const, start: start || null, end: end || null };
  }
  if (f.startsWith(">=")) {
    return { op: ">=" as const, value: f.slice(2).trim() };
  }
  if (f.startsWith("<=")) {
    return { op: "<=" as const, value: f.slice(2).trim() };
  }
  if (f.startsWith(">")) {
    return { op: ">" as const, value: f.slice(1).trim() };
  }
  if (f.startsWith("<")) {
    return { op: "<" as const, value: f.slice(1).trim() };
  }

  return { op: "=" as const, value: f };
}

function toDateSafe(v: string | null) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function toNumberSafe(v: string | null) {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toBoolSafe(v: string | null) {
  if (v == null) return null;
  const s = v.trim().toLowerCase();
  if (["true", "1", "yes", "y", "si", "sí"].includes(s)) return true;
  if (["false", "0", "no", "n"].includes(s)) return false;
  return null;
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

function domainItemToWhere(item: DomainItem) {
  const [field, operator, value] = item;

  if (!field || !operator || !isSafeKey(field)) return null;

  const path = splitPath(field);
  if (!path.length || path.length > MAX_PATH_DEPTH) return null;
  if (containsDeniedSegment(path)) return null;

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

  const modelDelegate = (prisma as any)[model];
  if (!modelDelegate) {
    return NextResponse.json(
      { error: "Model not found in Prisma client" },
      { status: 400 },
    );
  }

  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");

  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(
    200,
    Math.max(1, Number(searchParams.get("pageSize") ?? 20)),
  );

  const sortKey = searchParams.get("sortKey");
  const sortDir = (searchParams.get("sortDir") ?? "asc") as SortDir;

  const fieldsParam = searchParams.get("fields") ?? "";
  const requestedFields = fieldsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_FIELDS);

  let filters: Record<string, string> = {};
  const filtersParam = searchParams.get("filters");
  if (filtersParam) {
    try {
      filters = JSON.parse(filtersParam);
    } catch {
      return NextResponse.json(
        { error: "Invalid filters JSON" },
        { status: 400 },
      );
    }
  }

  const domain = parseDomain(searchParams.get("domain"));

  // const fieldPaths = requestedFields
  //   .filter(isSafeKey)
  //   .map(splitPath)
  //   .filter((p) => p.length > 0 && p.length <= MAX_PATH_DEPTH)
  //   .filter((p) => !containsDeniedSegment(p));

  const fieldPaths = requestedFields
    .filter(isSafeKey)
    .map(splitPath)
    .filter((p) => p.length > 0 && p.length <= MAX_PATH_DEPTH)
    .filter((p) => !containsDeniedSegment(p));

  const select = buildSelectFromFieldPaths(fieldPaths);

  const domainWhere = domain.map(domainItemToWhere).filter(Boolean) as any[];

  if (id) {
    try {
      const record = await modelDelegate.findFirst({
        where: {
          AND: [{ id: String(id) }, ...domainWhere],
        },
        select,
      });
      return NextResponse.json(record);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid query", details: String(e) },
        { status: 400 },
      );
    }
  }

  const andWhere: any[] = [...domainWhere];

  for (const [rawKey, rawVal] of Object.entries(filters)) {
    const key = rawKey.trim();
    const value = (rawVal ?? "").trim();
    if (!key || !value) continue;
    if (!isSafeKey(key)) continue;

    const path = splitPath(key);
    if (!path.length || path.length > MAX_PATH_DEPTH) continue;
    if (containsDeniedSegment(path)) continue;

    const bool = toBoolSafe(value);
    if (bool !== null) {
      andWhere.push(buildNestedWhere(path, bool));
      continue;
    }

    const parsed = parseRangeSyntax(value);
    if (!parsed) continue;

    if (parsed.op === "between") {
      const startDate = toDateSafe(parsed.start);
      const endDate = toDateSafe(parsed.end);

      if (startDate || endDate) {
        andWhere.push(
          buildNestedWhere(path, {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          }),
        );
        continue;
      }

      const startNum = toNumberSafe(parsed.start);
      const endNum = toNumberSafe(parsed.end);

      if (startNum !== null || endNum !== null) {
        andWhere.push(
          buildNestedWhere(path, {
            ...(startNum !== null ? { gte: startNum } : {}),
            ...(endNum !== null ? { lte: endNum } : {}),
          }),
        );
        continue;
      }

      andWhere.push(
        buildNestedWhere(path, { contains: value, mode: "insensitive" }),
      );
      continue;
    }

    if (parsed.op !== "=") {
      const date = toDateSafe(parsed.value ?? null);
      if (date) {
        const cond =
          parsed.op === ">="
            ? { gte: date }
            : parsed.op === "<="
              ? { lte: date }
              : parsed.op === ">"
                ? { gt: date }
                : { lt: date };

        andWhere.push(buildNestedWhere(path, cond));
        continue;
      }

      const num = toNumberSafe(parsed.value ?? null);
      if (num !== null) {
        const cond =
          parsed.op === ">="
            ? { gte: num }
            : parsed.op === "<="
              ? { lte: num }
              : parsed.op === ">"
                ? { gt: num }
                : { lt: num };

        andWhere.push(buildNestedWhere(path, cond));
        continue;
      }

      andWhere.push(
        buildNestedWhere(path, { contains: value, mode: "insensitive" }),
      );
      continue;
    }

    const eqNum = toNumberSafe(parsed.value ?? null);
    if (eqNum !== null) {
      andWhere.push(buildNestedWhere(path, eqNum));
      continue;
    }

    const eqDate = toDateSafe(parsed.value ?? null);
    if (eqDate) {
      const start = new Date(eqDate);
      start.setHours(0, 0, 0, 0);
      const next = new Date(start);
      next.setDate(next.getDate() + 1);
      andWhere.push(buildNestedWhere(path, { gte: start, lt: next }));
      continue;
    }

    const parts = value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    if (parts.length <= 1) {
      andWhere.push(
        buildNestedWhere(path, { contains: value, mode: "insensitive" }),
      );
    } else {
      const orList: any[] = parts.map((p) =>
        buildNestedWhere(path, { contains: p, mode: "insensitive" }),
      );
      andWhere.push({ OR: orList });
    }
  }

  const where = andWhere.length ? { AND: andWhere } : undefined;

  let orderBy: any = undefined;
  if (sortKey && isSafeKey(sortKey)) {
    const sortPath = splitPath(sortKey);
    if (sortPath.length <= MAX_PATH_DEPTH && !containsDeniedSegment(sortPath)) {
      orderBy = buildNestedOrderBy(sortPath, sortDir);
    }
  }

  try {
    const [total, rows] = await Promise.all([
      modelDelegate.count({ where }),
      modelDelegate.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select,
      }),
    ]);

    return NextResponse.json({ rows, total, page, pageSize });
  } catch (e) {
    return NextResponse.json(
      {
        error: "Invalid query (check fields/relations/sortKey/filters/domain)",
        details: String(e),
      },
      { status: 400 },
    );
  }
}
