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
  // const [access, setAccess] = useState<GroupLine[]>([]);

  // useEffect(() => {
  //   const entityType = pathName.split("/")[2];

  //   if (!entityType) {
  //     setAccess([]);

  //     return;
  //   }

  //   const getAccess = acc.filter((acc) => acc.entityType === entityType);

  //   setAccess(getAccess || []);
  // }, [pathName, acc]);

  const entityType = pathName.split("/")[2];

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
