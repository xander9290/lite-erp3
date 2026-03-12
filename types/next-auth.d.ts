import type { GroupLine } from "@prisma/client";
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  // 👇 Extender la interfaz User
  interface User extends DefaultUser {
    access: GroupLine[];
    // companies: { id: number; name: string; code: string | null }[];
  }

  // 👇 Extender la interfaz Session
  interface Session {
    user: {
      access: GroupLine[];
      //   companies: {
      //     id: number;
      //     name: string;
      //     code: string | null;
      //     current: boolean;
      //   }[];
    } & DefaultSession["user"];
  }
}
