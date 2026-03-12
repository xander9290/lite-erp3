"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { GroupLine } from "@/generated/prisma/client";

export function useAuth() {
  const { data: session, status } = useSession();

  const auth = useMemo(() => {
    const user = session?.user;
    const uid = user?.id;
    const roles = (user as any)?.roles ?? [];
    const access = session?.user.access || [];

    const hasRole = (role: string) => {
      return roles.includes(role);
    };

    const hasAnyRole = (roleList: string[]) => {
      return roleList.some((r) => roles.includes(r));
    };

    return {
      session,
      user,
      uid,
      roles,
      isAuthenticated: !!session,
      isLoading: status === "loading",
      isAdmin: roles.includes("admin"),
      hasRole,
      hasAnyRole,
      access,
    };
  }, [session, status]);

  return auth;
}
