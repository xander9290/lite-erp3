"use server";

import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import { sessionStore } from "@/app/libs/sessionStore";
import { type User, type Partner, Group } from "@/generated/prisma/client";

export interface UserWithProps extends User {
  Partner: Partner | null;
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
  groupId,
}: {
  name: string;
  login: string;
  email: string;
  active: boolean;
  groupId: string | null;
}): Promise<ActionResponse<UserWithProps>> {
  try {
    const { uid } = await sessionStore();
    console.log("-Creación de usuario");

    const newUser = await prisma.user.create({
      data: {
        name,
        login,
        active,
        password: "",
        createdUid: uid || "",
        ...(groupId && { Group: { connect: { id: groupId } } }),
        Partner: {
          create: {
            name,
            email,
            createdUid: uid || "",
          },
        },
      },
      include: {
        Partner: true,
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
  groupId,
}: {
  id: string | null;
  name: string;
  login: string;
  email: string;
  active: boolean;
  groupId: string | null;
}): Promise<ActionResponse<UserWithProps>> {
  try {
    if (!id) throw new Error("ID user is undefined");

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        login,
        active,
        Group: groupId ? { connect: { id: groupId } } : { disconnect: true },
        Partner: {
          update: {
            name,
            email,
          },
        },
      },
      include: {
        Partner: true,
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
