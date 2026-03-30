"use server";

import type { Group, GroupLine } from "@/generated/prisma/client";
import { getUserById } from "../../users/actions/user-actions";
import prisma from "@/app/libs/prisma";
import { ActionResponse } from "@/app/libs/definitions";
import { sessionStore } from "@/app/libs/sessionStore";
import { createAuditlog } from "@/app/(auth)/app/actions/auditlog-actions";
import { GroupSchemaType } from "../schemas/group.schema";

export interface GroupWithProps extends Group {
  Users: {
    name: string;
    id: string;
  }[];
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
          select: {
            id: true,
            name: true,
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

type GroupActionProps = Omit<GroupSchemaType, "createdAt" | "updatedAt">;

export async function createGroup({
  data,
}: {
  data: GroupActionProps;
}): Promise<ActionResponse<GroupWithProps>> {
  try {
    const { uid } = await sessionStore();

    for (const user of data.users) {
      const getUser = await getUserById({ id: user.id });
      if (getUser && getUser?.groupId !== null)
        throw new Error(
          `El usuario ${getUser?.Partner?.name} ya se encuentra asociado al grupo ${getUser?.Group?.name}. Es necesario removerlo del grupo para ser reasignado a ${name}.`,
        );
    }

    const newGroup = await prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
        data: {
          name: data.name,
          active: data.active,
          Users: {
            connect: data.users.map((u) => ({ id: u.id })),
          },
          createdUid: uid || "",
        },
        include: {
          Users: {
            select: {
              id: true,
              name: true,
            },
          },
          GroupLines: true,
        },
      });

      for (const line of data.lines) {
        let entityType: string = "";
        let fieldName: string = "";

        const fieldId = await tx.modelField.findUnique({
          where: { id: line.fieldId?.id },
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
  data,
}: {
  data: GroupActionProps & { id: string | null };
}): Promise<ActionResponse<GroupWithProps>> {
  try {
    if (!data.id) throw new Error("ID not defined");

    const { uid } = await sessionStore();

    for (const user of data.users) {
      const getUser = await getUserById({ id: user.id });
      if (getUser && getUser?.groupId !== null && getUser.groupId !== data.id)
        throw new Error(
          `El usuario ${getUser?.Partner?.name} ya se encuentra asociado al grupo ${getUser?.Group?.name}. Es necesario removerlo del grupo para ser reasignado a ${data.name}.`,
        );
    }

    const updatedGroup = await prisma.$transaction(async (tx) => {
      const group = await tx.group.update({
        where: { id: data.id! },
        data: {
          name: data.name,
          active: data.active,
          Users: {
            set: data.users.map((u) => ({ id: u.id })),
          },
          GroupLines: {
            deleteMany: {
              id: {
                notIn: data.lines
                  .filter((line) => line.id)
                  .map((line) => line.id!),
              },
            },
          },
        },
        include: {
          Users: {
            select: {
              id: true,
              name: true,
            },
          },
          GroupLines: true,
        },
      });

      for (const line of data.lines) {
        let entityType: string = "";
        let fieldName: string = "";

        const fieldId = await tx.modelField.findUnique({
          where: { id: line.fieldId?.id },
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
