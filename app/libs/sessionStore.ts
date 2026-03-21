"use server";

import { Session } from "next-auth";
import { auth } from "./auth";

interface useStore {
  user: Session["user"] | undefined;
  uid: string | null;
  //   currentCompany: { id: number; name: string; code: string | null } | null;
}

export async function sessionStore(): Promise<useStore> {
  const session = await auth();
  return {
    user: session?.user,
    uid: String(session?.user?.id) || null,
    // currentCompany: session?.user.companies.find((c) => c.current) || null,
  };
}
