import type { GroupLine } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  // 👇 Extender la interfaz User
  interface User extends DefaultUser {
    access: GroupLine[];
    companies: { id: string; name: string; code: string }[];
  }

  // 👇 Extender la interfaz Session
  interface Session {
    user: {
      access: GroupLine[];
      companies: {
        id: string;
        name: string;
        code: string;
        current: boolean;
      }[];
    } & DefaultSession["user"];
  }
}
