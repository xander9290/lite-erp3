import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "./prisma";
import bcrypt from "bcryptjs";

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

        user = {
          id: findUser.id,
          name: findUser.Partner?.name,
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
      }

      if (trigger === "update" && session.user) {
        token.id = session.user.id;
        token.name = session.user.name;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
});
