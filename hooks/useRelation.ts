import { useState, useRef, useCallback } from "react";

const relationCache = new Map<string, any[]>();

export function useRelation<T>({
  model,
  domain,
  limit = 5,
}: {
  model: string;
  domain?: any[];
  limit?: number;
}) {
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(
    (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        const key = `${model}-${JSON.stringify(domain)}-${query}-${limit}`;

        // ✅ 1. CACHE HIT
        if (relationCache.has(key)) {
          setOptions(relationCache.get(key) as T[]);
          return;
        }

        // ❌ cancelar request anterior
        if (abortRef.current) abortRef.current.abort();

        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);

        try {
          const params = new URLSearchParams({
            search: query,
            limit: String(limit),
            domain: JSON.stringify(domain ?? []),
          });

          const res = await fetch(`/api/m2o/${model}?${params}`, {
            signal: controller.signal,
          });

          const data = await res.json();
          const result = Array.isArray(data) ? data : [];

          // ✅ 2. GUARDAR EN CACHE
          relationCache.set(key, result);

          const MAX_CACHE = 50;

          if (relationCache.size > MAX_CACHE) {
            const firstKey = relationCache.keys().next().value;
            relationCache.delete(firstKey || "");
          }

          setOptions(result);
        } catch (e: any) {
          if (e.name !== "AbortError") console.error(e);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    [model, domain, limit],
  );

  return { options, loading, search };
}
