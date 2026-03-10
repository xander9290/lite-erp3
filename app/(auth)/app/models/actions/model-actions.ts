"use server";

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

    const newModel = await prisma.model.create({
      data: {
        label,
        description,
        name: `[${label}] ${description}`,
        active,
        ModelFields: {
          create: lines.map((line) => ({
            label: line.label,
            description: line.description,
            name: `[${line.label}] ${line.description}`,
            active: line.active,
            fieldType: line.fieldType,
            createdUid: uid || "",
          })),
        },
        createdUid: uid || "",
      },
      include: {
        ModelFields: true,
      },
    });

    if (!newModel) throw new Error("Error al crear modelo");

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
