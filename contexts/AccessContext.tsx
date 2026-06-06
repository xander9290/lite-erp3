"use client";

import type { GroupLine } from "@/generated/prisma/client";
import { useAuth } from "@/hooks/sessionStore";
import { usePathname } from "next/navigation";
import { createContext, ReactNode, useContext, Suspense, useMemo } from "react";

interface AccessContextProps {
  access: GroupLine[];
}

const AccessContext = createContext<AccessContextProps | null>(null);

// ✅ Provider visible para toda la app, con Suspense boundary
export function AccessProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AccessProviderInner>{children}</AccessProviderInner>
    </Suspense>
  );
}

// 👇 Provider interno que usa useSearchParams sin romper el prerender
function AccessProviderInner({ children }: { children: ReactNode }) {
  //   const params = useSearchParams();
  //   const entityType = params.get("entity") || null;
  const pathName = usePathname();

  const { access: acc } = useAuth();

  // const entityType = pathName.split("/")[2];
  const entityType = extractEntityFromPath(pathName);

  const access = useMemo(() => {
    if (!entityType) return [];

    return acc.filter((a) => a.entityType === entityType);
  }, [entityType, acc]);

  return (
    <AccessContext.Provider value={{ access }}>
      {children}
    </AccessContext.Provider>
  );
}

/**
 * Hook para obtener access filtrado por entityName
 */
export const useAccess = ({
  fieldName,
}: {
  fieldName: string;
}): GroupLine | undefined => {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error("useAccess debe usarse dentro de AccessProvider");
  }

  const fieldAccessProps = context.access.find(
    (acc) => acc.fieldName === fieldName,
  );

  return fieldAccessProps;
};

export const extractEntityFromPath = (pathname: string): string | null => {
  if (!pathname) return null;

  const cleanPath = pathname.split("?")[0];
  const segments = cleanPath.split("/").filter(Boolean);

  // Acciones y palabras reservadas (no son entidades)
  const SKIP_WORDS = new Set([
    "app",
    "new",
    "edit",
    "view",
    "create",
    "delete",
    "form",
    "list",
    "show",
    "settings",
    "config",
    "admin",
  ]);

  // Encontrar dónde empiezan los segmentos relevantes (después de 'app')
  const startIndex = segments.findIndex((s) => s === "app") + 1;

  if (startIndex === 0 || startIndex >= segments.length) return null;

  // Estrategia: Buscar el primer segmento que no sea una palabra reservada
  // y que tenga sentido como entidad
  for (let i = startIndex; i < segments.length; i++) {
    const current = segments[i];
    const next = segments[i + 1];

    // Saltar palabras reservadas
    if (SKIP_WORDS.has(current)) continue;

    // Si el siguiente es una acción, el actual es la entidad
    if (next && SKIP_WORDS.has(next)) {
      return current;
    }

    // Si es el último o el siguiente no es reservada, es candidato
    if (!next || !SKIP_WORDS.has(next)) {
      // Para casos como /app/product_template/products, tomar el último
      // que no sea product_template (si product_template es un contenedor)
      if (i < segments.length - 1 && current.includes("_template")) {
        continue; // Saltar templates, buscar siguiente
      }
      return current;
    }
  }

  // Fallback: retornar el último segmento que no sea reservado
  for (let i = segments.length - 1; i >= startIndex; i--) {
    if (!SKIP_WORDS.has(segments[i])) {
      return segments[i];
    }
  }

  return null;
};
