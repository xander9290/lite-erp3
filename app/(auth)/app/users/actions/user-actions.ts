"use server";

import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import { type User, type Partner, Group } from "@/generated/prisma/client";

export interface UserWithProps extends User {
  Partner: Partner | null;
  Manager: User | null;
  Group: Group | null;
}

export async function getUserById({
  id,
}: {
  id: string | null;
}): Promise<UserWithProps | null> {
  try {
    if (!id) {
      throw new Error("user id undefined");
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        Partner: true,
        Manager: true,
        Group: true,
      },
    });

    return user;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createUser({
  name,
  login,
  email,
  active,
  managerId,
}: {
  name: string;
  login: string;
  email: string;
  active: boolean;
  managerId: string | null;
}): Promise<ActionResponse<UserWithProps>> {
  try {
    console.log("-Creación de usuario");

    const newUser = await prisma.user.create({
      data: {
        login,
        active,
        password: "",
        Partner: {
          create: {
            name,
            email,
          },
        },
        ...(managerId && { Manager: { connect: { id: managerId } } }),
      },
      include: {
        Partner: true,
        Manager: true,
        Group: true,
      },
    });

    if (!newUser) {
      throw new Error("Error al crear usuario");
    }

    return {
      success: true,
      message: "Se ha creado el usuario",
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
  login,
  email,
  active,
  managerId,
}: {
  id: string | null;
  name: string;
  login: string;
  email: string;
  active: boolean;
  managerId: string | null;
}): Promise<ActionResponse<UserWithProps>> {
  try {
    if (!id) throw new Error("ID user is undefined");

    const updatedUser = await prisma.user.update({
      where: { id },
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
        Manager: managerId
          ? { connect: { id: managerId } }
          : { disconnect: true },
      },
      include: {
        Partner: true,
        Manager: true,
        Group: true,
      },
    });

    return {
      success: true,
      message: "Se ha modificado el usuario",
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
