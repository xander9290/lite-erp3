"use server";

import { Session } from "next-auth";
import { auth } from "./auth";

interface UseStore {
  user: Session["user"] | undefined;
  uid: string | null;
  company: { id: string; name: string; code: string };
}

export async function sessionStore(): Promise<UseStore> {
  const session = await auth();
  const getCurrentCompany = session?.user.companies.find((c) => c.current) || null;
  let company: UseStore["company"] = { id: "", name: "", code: "" };
  if (getCurrentCompany) {
    company = { id: getCurrentCompany.id, name: getCurrentCompany.name, code: getCurrentCompany.code };
  }
  return {
    user: session?.user,
    uid: String(session?.user?.id) || null,
    company,
  };
}
