"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status, update } = useSession();

  const changeCompany = async ({ companyId }: { companyId: string }) => {
    const changedCompany = session?.user.companies.map((company) => {
      if (company.id == companyId) {
        company = {
          ...company,
          current: true,
        };
      } else {
        company = {
          ...company,
          current: false,
        };
      }

      return company;
    });

    const newSession = {
      ...session?.user,
      companies: changedCompany,
    };

    await update({ user: newSession });
  };

  const auth = useMemo(() => {
    const user = session?.user;
    const uid = user?.id;
    const access = session?.user.access || [];
    const companyCode =
      session?.user.companies.find((c) => c.current)?.code || null;

    const companyId = session?.user.companies.find((c) => c.current)?.id || "";

    return {
      session,
      user,
      uid,
      isAuthenticated: !!session,
      access,
      changeCompany,
      companyCode,
      companyId,
    };
  }, [session, status, changeCompany]);

  return auth;
}
