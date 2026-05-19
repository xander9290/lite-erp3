"use server";

import prisma from "@/app/libs/prisma";
import type { ModelField } from "@/generated/prisma/client";
import { ModelFieldSchemaType } from "../schemas/modelFields.schema";
import { sessionStore } from "@/app/libs/sessionStore";
import { ActionResponse } from "@/app/libs/definitions";
import { createAuditlog } from "@/app/(auth)/app/actions/auditlog-actions";
import { serverLog } from "@/app/libs/helpers";

export interface ModelFieldWithProps extends ModelField {
  Model: {
    id: string;
    name: string;
  };
}

export async function getModelFieldById({ id }: { id: string | null }): Promise<ModelFieldWithProps | null> {
  try {
    if (!id) throw new Error("ID not defined");

    const modelField = await prisma.modelField.findUnique({
      where: { id },
      include: {
        Model: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    serverLog({ action: "Fetching", model: "model fields", data: modelField });
    return modelField;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

type NewModelFieldData = Pick<ModelFieldSchemaType, "label" | "description" | "fieldType" | "active" | "modelId">;

export async function createModelField({ data }: { data: NewModelFieldData }): Promise<ActionResponse<ModelFieldWithProps>> {
  try {
    const { uid } = await sessionStore();

    serverLog({ action: "Creating", model: "model fields", data });
    const newModelField = await prisma.modelField.create({
      data: {
        name: `[${data.label}] ${data.description}`,
        label: data.label,
        description: data.description,
        fieldType: data.fieldType,
        active: data.active,
        createdUid: uid || "",
        Model: {
          connect: {
            id: data.modelId.id,
          },
        },
      },
      include: {
        Model: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!newModelField) throw new Error("No fue posible crear el registro");

    await createAuditlog({
      action: "create",
      entityId: newModelField.id,
      entityType: "modelFields",
      log: "Ha creado el registro",
    });

    return {
      success: true,
      message: "Se ha creado el registros",
      data: newModelField,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function updateModelField({ data }: { data: NewModelFieldData & { id: string | null } }): Promise<ActionResponse<ModelFieldWithProps>> {
  try {
    if (!data.id) throw new Error("ID not defined");

    serverLog({ action: "Updating", model: "model fields", data });
    const updatedModelField = await prisma.modelField.update({
      where: { id: data.id },
      data: {
        name: `[${data.label}] ${data.description}`,
        label: data.label,
        description: data.description,
        fieldType: data.fieldType,
        active: data.active,
        modelId: data.modelId.id,
      },
      include: {
        Model: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!updateModelField) throw new Error("No fue posible actualizar el registro");

    await createAuditlog({
      action: "update",
      entityId: updatedModelField.id,
      entityType: "modelFields",
      log: "Ha actualizado el registro",
    });

    return {
      success: true,
      message: "Se ha actualizado el registro",
      data: updatedModelField,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function deleteModelFields({ ids }: { ids: string[] }): Promise<ActionResponse<boolean>> {
  try {
    const hasGroups = await prisma.group.findFirst({
      where: {
        GroupLines: {
          some: {
            fieldId: { in: ids },
          },
        },
      },
    });

    if (hasGroups) throw new Error("No es posible eliminar registros con grupos asociados");

    await prisma.modelField.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    serverLog({ action: "Deleting", model: "model fields", data: ids });

    return {
      success: true,
      message: "Se han eliminado los registros",
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
