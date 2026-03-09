"use server";

import { createAuditlog } from "@/app/actions/auditlog-actions";
import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import { sessionStore } from "@/app/libs/sessionStore";
import { type User, type Partner, Group } from "@/generated/prisma/client";
import bcrypt from "bcryptjs";

export interface UserWithPartner extends User {
  Partner: Partner | null;
}

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
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function getUserByLogin({
  login,
}: {
  login: string;
}): Promise<UserWithProps | null> {
  try {
    if (!login) {
      throw new Error("user login undefined");
    }

    const user = await prisma.user.findUnique({
      where: { login },
      include: {
        Partner: true,
        Group: true,
      },
    });

    return user;
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
  imageUrl,
}: {
  name: string;
  login: string;
  email: string;
  active: boolean;
  groupId: string | null;
  imageUrl: string | null;
}): Promise<ActionResponse<UserWithProps>> {
  try {
    const { uid } = await sessionStore();

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
            imageUrl,
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

    await createAuditlog({
      action: "create",
      entityId: newUser.id,
      entityType: "users",
      log: "Creó el registro",
    });

    return {
      success: true,
      message: "Se ha creado el usuario",
      data: newUser,
    };
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
  imageUrl,
}: {
  id: string | null;
  name: string;
  login: string;
  email: string;
  active: boolean;
  groupId: string | null;
  imageUrl: string | null;
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
            imageUrl,
          },
        },
      },
      include: {
        Partner: true,
        Group: true,
      },
    });

    if (!updatedUser) throw new Error("No fue posible editar el usuario");

    await createAuditlog({
      action: "update",
      entityId: updatedUser.id,
      entityType: "users",
      log: "Modificó el registro",
    });

    return {
      success: true,
      message: "Se ha modificado el usuario",
      data: updatedUser,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function updatePassword({
  id,
  password,
}: {
  id: string | null;
  password: string;
}): Promise<ActionResponse<boolean>> {
  try {
    if (!id) throw new Error("ID not defined");

    const hashedPswd = await bcrypt.hash(password, 10);

    const changedPassword = await prisma.user.update({
      where: { id },
      data: {
        password: hashedPswd,
      },
    });

    if (!changedPassword) throw new Error("Error al cambiar la contraseña");

    await createAuditlog({
      action: "update",
      entityId: id,
      entityType: "users",
      log: "Cambió la contraseña",
    });

    return {
      success: true,
      message: "La contraseña se ha cambiado",
      data: true,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
