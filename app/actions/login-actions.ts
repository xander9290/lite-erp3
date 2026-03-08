"use server";

import { signIn } from "../libs/auth";
import { ActionResponse } from "../libs/definitions";
import prisma from "../libs/prisma";

export async function userLogin({
  login,
  password,
}: {
  login: string;
  password: string;
}): Promise<ActionResponse<boolean>> {
  try {
    console.log(`User login [${login}]`);
    const user = await prisma.user.findUnique({
      where: { login },
    });

    if (user && !user.active) {
      throw new Error("Usuario inactivo");
    }

    await signIn("credentials", { login, password, redirect: false });

    return {
      success: true,
      message: "Sesión iniciada",
      data: true,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: `${error.cause ? String(error.cause.err) : error.message}`,
    };
  }
}
