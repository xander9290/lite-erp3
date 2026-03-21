import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "./prisma";
import bcrypt from "bcryptjs";
import type { GroupLine } from "@/generated/prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        login: {
          type: "text",
          label: "Usuario",
        },
        password: {
          type: "password",
          label: "Contraseña",
        },
      },
      authorize: async (credentials) => {
        const { login, password } = credentials;
        let user = null;

        const findUser = await prisma.user.findUnique({
          where: { login: login as string },
          include: {
            Partner: true,
            Group: {
              where: {
                active: true,
              },
              include: {
                GroupLines: true,
              },
            },
          },
        });

        if (!findUser) {
          throw new Error("Usuario no encontrado");
        }

        const hashedPassword = findUser.password;
        const validatePassword = await bcrypt.compare(
          password as string,
          hashedPassword,
        );

        if (!validatePassword) {
          throw new Error("Contraseña incorrecta");
        }

        await prisma.user.update({
          where: { id: findUser.id },
          data: {
            lastLogin: new Date(),
          },
        });

        user = {
          id: findUser.id,
          name: findUser.Partner?.name,
          image: findUser.Partner?.imageUrl,
          access: findUser.Group?.GroupLines || [],
        };

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24,
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.picture = user.image;
        token.access = user.access;
      }

      if (trigger === "update" && session.user) {
        token.id = session.user.id;
        token.name = session.user.name;
        token.picture = session.user.image;
        token.access = session.user.access;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        session.user.access = token.access as GroupLine[];
      }
      return session;
    },
  },
});
