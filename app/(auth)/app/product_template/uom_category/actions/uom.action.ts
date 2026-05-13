"use server";

import type { UomCategory } from "@/generated/prisma/client";
import { UomSchemaType } from "../schemas/uom.schema";
import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import { sessionStore } from "@/app/libs/sessionStore";
import { createAuditlog } from "../../../actions/auditlog-actions";

export interface UomWithProps extends UomCategory {
  Products: { id: string; name: string }[];
}

export type UomActionProps = Omit<
  UomSchemaType,
  "createdAt" | "updatedAt" | "createdUid"
>;

export async function getUomById({
  id,
}: {
  id: string | null;
}): Promise<UomWithProps | null> {
  try {
    if (!id) throw new Error("ID not defined");
    const uom = await prisma.uomCategory.findUnique({
      where: { id },
      include: {
        Products: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return uom;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createUom({
  data,
}: {
  data: UomActionProps;
}): Promise<ActionResponse<UomWithProps>> {
  try {
    const { uid } = await sessionStore();

    const name = `[${data.code}] ${data.description}`;

    const createdUom = await prisma.uomCategory.create({
      data: {
        name: name,
        description: data.description,
        code: data.code,
        ratio: Number(data.ratio),
        isBaseUnit: data.isBaseUnit,
        createUid: uid || "",
      },
      include: {
        Products: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await createAuditlog({
      action: "create",
      entityId: createdUom.id,
      entityType: "uomCategory",
      log: "Ha creado el registro",
    });

    return {
      success: true,
      message: "Se ha creado el registro",
      data: createdUom,
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

export async function updateUom({
  id,
  data,
}: {
  id: string | null;
  data: UomActionProps;
}): Promise<ActionResponse<UomWithProps>> {
  try {
    if (!id) throw new Error("ID not defined");

    const name = `[${data.code}] ${data.description}`;

    const updatedUom = await prisma.uomCategory.update({
      where: { id },
      data: {
        name: name,
        description: data.description,
        code: data.code,
        ratio: Number(data.ratio),
        isBaseUnit: data.isBaseUnit,
      },
      include: {
        Products: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await createAuditlog({
      action: "update",
      entityId: updatedUom.id,
      entityType: "uomCategory",
      log: "Ha editado el registro",
    });

    return {
      success: true,
      message: "Se ha editado el registro",
      data: updatedUom,
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}
