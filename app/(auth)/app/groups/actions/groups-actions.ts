"use server";

import type { Group } from "@/generated/prisma/client";
import { UserWithProps } from "../../users/actions/user-actions";
import prisma from "@/app/libs/prisma";
import { ActionResponse } from "@/app/libs/definitions";
import { sessionStore } from "@/app/libs/sessionStore";

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    return {
      message: "El group ha sido creado",
      success: true,
      data: newGroup,
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

    if (!updateGroup) throw new Error("No fue posible editar el grupo");

    return {
      message: "El group ha sido creado",
      success: true,
      data: updatedGroup,
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
