// /app/utils/getByPath.ts

// export function getByPath(obj: unknown, path: string): unknown {
//   return path.split(".").reduce<unknown>((acc, key) => {
//     if (
//       acc &&
//       typeof acc === "object" &&
//       key in (acc as Record<string, unknown>)
//     ) {
//       return (acc as Record<string, unknown>)[key];
//     }
//     return undefined;
//   }, obj);
// }

type PathSegment = {
  key: string;
  isArray: boolean;
};

function parsePath(path: string): PathSegment[] {
  return path
    .split(".")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const isArray = segment.endsWith("[]");
      return {
        key: isArray ? segment.slice(0, -2) : segment,
        isArray,
      };
    });
}

export function getByPath(obj: unknown, path: string): unknown {
  if (!obj || !path) return undefined;

  const segments = parsePath(path);

  const walk = (current: unknown, index: number): unknown => {
    if (index >= segments.length) return current;
    if (current == null) return undefined;

    const { key, isArray } = segments[index];

    if (Array.isArray(current)) {
      return current
        .map((item) => walk(item, index))
        .flat()
        .filter((v) => v != null && v !== "");
    }

    if (typeof current !== "object") return undefined;

    const next = (current as Record<string, unknown>)[key];

    if (isArray) {
      if (!Array.isArray(next)) return [];
      return next
        .map((item) => walk(item, index + 1))
        .flat()
        .filter((v) => v != null && v !== "");
    }

    return walk(next, index + 1);
  };

  return walk(obj, 0);
}
