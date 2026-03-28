"use server";

import { createAuditlog } from "@/app/(auth)/app/actions/auditlog-actions";
import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import { sessionStore } from "@/app/libs/sessionStore";
import { FieldType, Model, ModelField } from "@/generated/prisma/client";

export interface ModelWithProps extends Model {
  ModelFields: ModelField[];
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
        ModelFields: true,
      },
    });

    return model;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createModel({
  label,
  description,
  active,
  lines,
}: {
  label: string;
  description: string;
  active: boolean;
  lines: {
    label: string;
    description: string;
    active: boolean;
    fieldType: FieldType;
  }[];
}): Promise<ActionResponse<ModelWithProps>> {
  try {
    const { uid } = await sessionStore();

    const name = `[${label}] ${description}`;

    const newModel = await prisma.model.create({
      data: {
        label,
        description,
        name,
        active,
        ModelFields: {
          createMany: {
            data: lines.map((line) => ({
              label: line.label,
              description: line.description,
              name: `[${label}] ${line.label}`,
              active: line.active,
              fieldType: line.fieldType,
              createdUid: uid || "",
            })),
          },
        },
        createdUid: uid || "",
      },
      include: {
        ModelFields: true,
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
  id,
  label,
  description,
  active,
  lines,
}: {
  id: string | null;
  label: string;
  description: string;
  active: boolean;
  lines: {
    id?: string;
    label: string;
    description: string;
    active: boolean;
    fieldType: FieldType;
  }[];
}): Promise<ActionResponse<ModelWithProps>> {
  try {
    if (!id) throw new Error("ID not defined");

    const { uid } = await sessionStore();

    const changedModel = await prisma.model.update({
      where: { id },
      data: {
        label,
        description,
        name: `[${label}] ${description}`,
        active,
        ModelFields: {
          deleteMany: {
            id: {
              notIn: lines.filter((line) => line.id).map((line) => line.id!),
            },
          },
          upsert: lines.map((line) => ({
            where: { id: line.id ?? "" },
            update: {
              name: `[${label}] ${line.label}`,
              label: line.label,
              description: line.description,
              active: line.active,
              fieldType: line.fieldType,
            },
            create: {
              name: `[${label}] ${line.label}`,
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
        ModelFields: true,
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
