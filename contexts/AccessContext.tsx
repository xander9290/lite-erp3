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

  const segments = pathname.split("/").filter(Boolean);

  // Casos comunes:
  // /app/users -> users
  // /app/users/new -> users
  // /app/invoicing_settings/payment_term -> payment_term (último segmento)
  // /app/invoicing_settings/payment_term/edit -> payment_term

  if (segments.length < 2) return null;

  // Buscar el índice de 'app' (primer segmento suele ser 'app')
  const appIndex = segments.findIndex((s) => s === "app");
  const startIndex = appIndex !== -1 ? appIndex + 1 : 1;

  if (segments.length <= startIndex) return null;

  const potentialEntity = segments[startIndex];
  const nextSegment = segments[startIndex + 1];

  // Si el siguiente segmento es una acción CRUD común, tomar el actual
  const commonActions = new Set([
    "new",
    "edit",
    "view",
    "create",
    "delete",
    "form",
    "list",
  ]);

  if (nextSegment && commonActions.has(nextSegment)) {
    return potentialEntity;
  }

  // Para rutas como invoicing_settings/payment_term, tomar el último segmento significativo
  if (
    potentialEntity?.includes("_settings") ||
    potentialEntity === "settings"
  ) {
    return segments[segments.length - 1];
  }

  return potentialEntity;
};
