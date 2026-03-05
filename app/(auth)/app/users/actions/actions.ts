"use server";

import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import { Partner, User } from "@/generated/prisma/client";

export interface UserWithProps extends User {
  Partner: Partner | null;
}

export async function getUserById({
  id,
}: {
  id: string | null;
}): Promise<UserWithProps | null> {
  try {
    if (!id) throw new Error("ID not defined");

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        Partner: true,
      },
    });

    if (!user) throw new Error("Record not found");

    return user;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createUser({
  name,
  email,
  login,
  active,
}: {
  name: string;
  email: string;
  login: string;
  active: boolean;
}): Promise<ActionResponse<UserWithProps>> {
  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        login,
        password: "",
        active,
        Partner: {
          create: {
            name,
            email,
          },
        },
      },
      include: {
        Partner: true,
      },
    });

    if (!newUser) throw new Error("Error al crear usuario");

    return {
      success: true,
      message: "Usuario creado",
      data: newUser,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function updateUser({
  id,
  name,
  email,
  login,
  active,
}: {
  id: string | null;
  name: string;
  email: string;
  login: string;
  active: boolean;
}): Promise<ActionResponse<UserWithProps>> {
  try {
    if (!id) throw new Error("ID not defined");

    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        name,
        login,
        active,
        Partner: {
          update: {
            name,
            email,
          },
        },
      },
      include: {
        Partner: true,
      },
    });

    if (!updatedUser) throw new Error("Error al editar usuario");

    return {
      success: true,
      message: "Usuario editado",
      data: updatedUser,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
