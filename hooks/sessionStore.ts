"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  const auth = useMemo(() => {
    const user = session?.user;
    const uid = user?.id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roles = (user as any)?.roles ?? [];

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
    };
  }, [session, status]);

  return auth;
}
