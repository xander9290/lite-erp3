"use server";

import type { Group, GroupLine, User } from "@/generated/prisma/client";
import { getUserById } from "../../users/actions/user-actions";
import prisma from "@/app/libs/prisma";
import { ActionResponse } from "@/app/libs/definitions";
import { sessionStore } from "@/app/libs/sessionStore";
import { createAuditlog } from "@/app/actions/auditlog-actions";

export interface GroupWithProps extends Group {
  Users: User[];
  GroupLines: GroupLine[];
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
        GroupLines: true,
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
  lines,
}: {
  name: string;
  active: boolean;
  users: string[];
  lines: {
    fieldId: string | null;
    invisible: boolean;
    required: boolean;
    readonly: boolean;
    notCreate: boolean;
    notEdit: boolean;
  }[];
}): Promise<ActionResponse<GroupWithProps>> {
  try {
    const { uid } = await sessionStore();

    for (const user of users) {
      const getUser = await getUserById({ id: user });
      if (getUser && getUser?.groupId !== null)
        throw new Error(
          `El usuario ${getUser?.Partner?.name} ya se encuentra asociado al grupo ${getUser?.Group?.name}. Es necesario removerlo del grupo para ser reasignado a ${name}.`,
        );
    }

    const newGroup = await prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
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
          GroupLines: true,
        },
      });

      for (const line of lines) {
        let entityType: string = "";
        let fieldName: string = "";

        const fieldId = await tx.modelField.findUnique({
          where: { id: line.fieldId || "" },
        });

        const modelId = await tx.model.findUnique({
          where: { id: fieldId?.modelId },
        });

        entityType = modelId ? modelId.label : "";
        fieldName = fieldId ? fieldId.label : "";

        await tx.groupLine.create({
          data: {
            entityType,
            fieldName,
            modelId: modelId ? modelId.id : "",
            fieldId: fieldId ? fieldId.id : "",
            invisible: line.invisible,
            required: line.required,
            readonly: line.readonly,
            notCreate: line.notCreate,
            notEdit: line.notEdit,
            groupId: group.id,
            createdUid: uid || "",
          },
        });
      }

      return group;
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
  lines,
}: {
  id: string | null;
  name: string;
  active: boolean;
  users: string[];
  lines: {
    id?: string;
    fieldId: string | null;
    invisible: boolean;
    required: boolean;
    readonly: boolean;
    notCreate: boolean;
    notEdit: boolean;
  }[];
}): Promise<ActionResponse<GroupWithProps>> {
  try {
    if (!id) throw new Error("ID not defined");

    const { uid } = await sessionStore();

    for (const user of users) {
      const getUser = await getUserById({ id: user });
      if (getUser && getUser?.groupId !== null && getUser.groupId !== id)
        throw new Error(
          `El usuario ${getUser?.Partner?.name} ya se encuentra asociado al grupo ${getUser?.Group?.name}. Es necesario removerlo del grupo para ser reasignado a ${name}.`,
        );
    }

    const updatedGroup = await prisma.$transaction(async (tx) => {
      const group = await tx.group.update({
        where: { id },
        data: {
          name,
          active,
          Users: {
            set: users.map((u) => ({ id: u })),
          },
          GroupLines: {
            deleteMany: {
              id: {
                notIn: lines.filter((line) => line.id).map((line) => line.id!),
              },
            },
          },
        },
        include: {
          Users: {
            include: {
              Partner: true,
              Group: true,
            },
          },
          GroupLines: true,
        },
      });

      for (const line of lines) {
        let entityType: string = "";
        let fieldName: string = "";

        const fieldId = await tx.modelField.findUnique({
          where: { id: line.fieldId || "" },
        });

        const modelId = await tx.model.findUnique({
          where: { id: fieldId?.modelId },
        });

        entityType = modelId ? modelId.label : "";
        fieldName = fieldId ? fieldId.label : "";

        await tx.groupLine.upsert({
          where: { id: line.id ?? "" },
          update: {
            entityType,
            fieldName,
            modelId: modelId ? modelId.id : "",
            fieldId: fieldId ? fieldId.id : "",
            invisible: line.invisible,
            required: line.required,
            readonly: line.readonly,
            notCreate: line.notCreate,
            notEdit: line.notEdit,
          },
          create: {
            entityType,
            fieldName,
            modelId: modelId ? modelId.id : "",
            fieldId: fieldId ? fieldId.id : "",
            invisible: line.invisible,
            required: line.required,
            readonly: line.readonly,
            notCreate: line.notCreate,
            notEdit: line.notEdit,
            groupId: group.id,
            createdUid: uid || "",
          },
        });
      }
      return group;
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
