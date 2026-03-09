"use server";

import type { Group } from "@/generated/prisma/client";
import { getUserById, UserWithProps } from "../../users/actions/user-actions";
import prisma from "@/app/libs/prisma";
import { ActionResponse } from "@/app/libs/definitions";
import { sessionStore } from "@/app/libs/sessionStore";
import { createAuditlog } from "@/app/actions/auditlog-actions";

export interface GroupWithProps extends Group {
  Users: UserWithProps[];
}

export async function getGroupById({
  id,
}: {
  id: string | null;
}): Promise<GroupWithProps | null> {
  try {
    if (!id) return null;

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        Users: {
          include: {
            Partner: true,
            Group: true,
          },
        },
      },
    });

    return group;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createGroup({
  name,
  active,
  users,
}: {
  name: string;
  active: boolean;
  users: string[];
}): Promise<ActionResponse<GroupWithProps>> {
  try {
    const { uid } = await sessionStore();

    const newGroup = await prisma.group.create({
      data: {
        name,
        active,
        Users: {
          connect: users.map((u) => ({ id: u })),
        },
        createdUid: uid || "",
      },
      include: {
        Users: {
          include: {
            Partner: true,
            Group: true,
          },
        },
      },
    });

    if (!newGroup) throw new Error("No fue posible crear el grupo");

    await createAuditlog({
      action: "create",
      entityId: newGroup.id,
      entityType: "groups",
      log: "Creó el registro",
    });

    return {
      message: "El grupo ha sido creado",
      success: true,
      data: newGroup,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function updateGroup({
  id,
  name,
  active,
  users,
}: {
  id: string | null;
  name: string;
  active: boolean;
  users: string[];
}): Promise<ActionResponse<GroupWithProps>> {
  try {
    if (!id) throw new Error("ID not defined");

    for (const user of users) {
      const getUser = await getUserById({ id: user });
      if (getUser && getUser?.groupId !== null && getUser.groupId !== id)
        throw new Error(
          `El usuario ${getUser?.Partner?.name} ya se encuentra asociado al grupo ${getUser?.Group?.name}. Es necesario removerlo del grupo para ser reasignado a ${name}.`,
        );
    }

    const updatedGroup = await prisma.group.update({
      where: { id },
      data: {
        name,
        active,
        Users: {
          set: users.map((u) => ({ id: u })),
        },
      },
      include: {
        Users: {
          include: {
            Partner: true,
            Group: true,
          },
        },
      },
    });

    if (!updatedGroup) throw new Error("No fue posible editar el grupo");

    await createAuditlog({
      action: "update",
      entityId: updatedGroup.id,
      entityType: "groups",
      log: "Modificó el registro",
    });

    return {
      message: "El grupo ha sido modificado",
      success: true,
      data: updatedGroup,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
