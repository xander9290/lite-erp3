"use server";

import { createAuditlog } from "@/app/(auth)/app/actions/auditlog-actions";
import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import { sessionStore } from "@/app/libs/sessionStore";
import { FieldType, Model } from "@/generated/prisma/client";
import { ModelSchemaType } from "../schemas/model.schema";

export interface ModelWithProps extends Model {
  ModelFields: {
    name: string;
    id: string;
    label: string;
    description: string;
    fieldType: FieldType;
    active: boolean;
  }[];
}

export async function getModelById({
  id,
}: {
  id: string | null;
}): Promise<ModelWithProps | null> {
  try {
    if (!id) throw new Error("ID not defined");
    const model = await prisma.model.findUnique({
      where: { id },
      include: {
        ModelFields: {
          select: {
            id: true,
            name: true,
            label: true,
            description: true,
            active: true,
            fieldType: true,
          },
        },
      },
    });

    return model;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createModel({
  data,
}: {
  data: ModelSchemaType;
}): Promise<ActionResponse<ModelWithProps>> {
  try {
    const { uid } = await sessionStore();

    const name = `[${data.label}] ${data.description}`;

    const newModel = await prisma.model.create({
      data: {
        label: data.label,
        description: data.description,
        name,
        active: data.active,
        ModelFields: {
          createMany: {
            data: data.lines.map((line) => ({
              label: line.label,
              description: line.description,
              name: `[${data.label}] ${line.label}`,
              active: line.active,
              fieldType: line.fieldType,
              createdUid: uid || "",
            })),
          },
        },
        createdUid: uid || "",
      },
      include: {
        ModelFields: {
          select: {
            id: true,
            name: true,
            label: true,
            description: true,
            active: true,
            fieldType: true,
          },
        },
      },
    });

    if (!newModel) throw new Error("Error al crear modelo");

    await createAuditlog({
      action: "create",
      entityId: newModel.id,
      entityType: "models",
      log: "Ha creado el registro",
    });

    return {
      success: true,
      message: "El modelo se ha creado",
      data: newModel,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function updateModel({
  data,
}: {
  data: ModelSchemaType & { id: string | null };
}): Promise<ActionResponse<ModelWithProps>> {
  try {
    if (!data.id) throw new Error("ID not defined");

    const { uid } = await sessionStore();

    const changedModel = await prisma.model.update({
      where: { id: data.id },
      data: {
        label: data.label,
        description: data.description,
        name: `[${data.label}] ${data.description}`,
        active: data.active,
        ModelFields: {
          deleteMany: {
            id: {
              notIn: data.lines
                .filter((line) => line.id)
                .map((line) => line.id!),
            },
          },
          upsert: data.lines.map((line) => ({
            where: { id: line.id ?? "" },
            update: {
              name: `[${data.label}] ${line.label}`,
              label: line.label,
              description: line.description,
              active: line.active,
              fieldType: line.fieldType,
            },
            create: {
              name: `[${data.label}] ${line.label}`,
              label: line.label,
              description: line.description,
              active: line.active,
              fieldType: line.fieldType,
              createdUid: uid || "",
            },
          })),
        },
      },
      include: {
        ModelFields: {
          select: {
            id: true,
            name: true,
            label: true,
            description: true,
            active: true,
            fieldType: true,
          },
        },
      },
    });

    if (!changedModel) throw new Error("Error al editar modelo");

    await createAuditlog({
      action: "update",
      entityId: changedModel.id,
      entityType: "models",
      log: "Ha editado el registro",
    });

    return {
      success: true,
      message: "El modelo se ha creado",
      data: changedModel,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
