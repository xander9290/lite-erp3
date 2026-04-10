"use server";

import { createAuditlog } from "@/app/(auth)/app/actions/auditlog-actions";
import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import { sessionStore } from "@/app/libs/sessionStore";
import type { User, GroupLine } from "@/generated/prisma/client";
import bcrypt from "bcryptjs";
import { UserSchemaType } from "../schemas/user.schema";

export interface UserWithPartner extends User {
  Partner: {
    name: string;
    email: string | null;
    imageUrl: string | null;
  } | null;
  Group: {
    name: string;
    id: string;
  } | null;
  Companies: {
    name: string;
    id: string;
  }[];
}

export interface UserWithProps extends User {
  Partner: {
    name: string;
    email: string | null;
    imageUrl: string | null;
  } | null;
  Group: {
    name: string;
    id: string;
  } | null;
  Companies: {
    name: string;
    id: string;
  }[];
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
        Partner: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        Group: {
          select: {
            id: true,
            name: true,
          },
        },
        Companies: {
          select: {
            id: true,
            name: true,
          },
        },
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
        Companies: true,
      },
    });

    return user;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

type UserActionProps = Omit<
  UserSchemaType,
  "createdAt" | "createdUid" | "updatedAt"
>;

export async function createUser({
  data,
}: {
  data: UserActionProps;
}): Promise<ActionResponse<UserWithProps>> {
  try {
    const { uid } = await sessionStore();

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        login: data.login,
        active: data.active,
        password: "",
        createdUid: uid || "",
        ...(data.groupId?.id && {
          Group: { connect: { id: data.groupId.id } },
        }),
        Partner: {
          create: {
            name: data.name,
            email: data.email,
            imageUrl: data.imageUrl,
            createdUid: uid || "",
          },
        },
        Companies: {
          connect: data.companies.map((c) => ({ id: c.id })),
        },
      },
      include: {
        Partner: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        Group: {
          select: {
            id: true,
            name: true,
          },
        },
        Companies: {
          select: {
            id: true,
            name: true,
          },
        },
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
  data,
}: {
  id: string | null;
  data: UserActionProps;
}): Promise<ActionResponse<UserWithProps>> {
  try {
    if (!id) throw new Error("ID user is undefined");

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        login: data.login,
        active: data.active,
        Group: data.groupId?.id
          ? { connect: { id: data.groupId.id } }
          : { disconnect: true },
        Companies: {
          set: data.companies.map((c) => ({ id: c.id })),
        },
        Partner: {
          update: {
            name: data.name,
            email: data.email,
            imageUrl: data.imageUrl,
          },
        },
      },
      include: {
        Partner: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        Group: {
          select: {
            id: true,
            name: true,
          },
        },
        Companies: {
          select: {
            id: true,
            name: true,
          },
        },
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

export async function getUserAccess({
  id,
}: {
  id: string | null;
}): Promise<GroupLine[]> {
  try {
    if (!id) throw new Error("ID NOT DEFINED");

    const access = await prisma.groupLine.findMany({
      where: {
        Group: {
          Users: {
            some: { id },
          },
        },
      },
    });

    return access;
  } catch (error: any) {
    console.log(error);
    return [];
  }
}
