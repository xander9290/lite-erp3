"use server";

import prisma from "@/app/libs/prisma";
import { WarehouseSchemaType } from "../schemas/warehouse.schema";
import type { Warehouse } from "@/generated/prisma/client";
import { sessionStore } from "@/app/libs/sessionStore";
import { ActionResponse } from "@/app/libs/definitions";
import { createAuditlog } from "../../actions/auditlog-actions";

export interface WarehouseWithProps extends Warehouse {
  Company: {
    id: string;
    name: string;
  };
  InternalsFrom: {
    id: string;
    name: string;
  }[];
}

export async function getWarehouseById({
  id,
}: {
  id: string | null;
}): Promise<WarehouseWithProps | null> {
  try {
    if (!id) throw new Error("ID not definded");

    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        Company: {
          select: {
            id: true,
            name: true,
          },
        },
        InternalsFrom: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return warehouse;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

type WarehouseActionProps = Omit<
  WarehouseSchemaType,
  "updatedAt" | "createdAt" | "createdUid"
>;

export async function createWarehouse({
  data,
}: {
  data: WarehouseActionProps;
}): Promise<ActionResponse<WarehouseWithProps>> {
  try {
    const { uid } = await sessionStore();

    const newWarehouse = await prisma.warehouse.create({
      data: {
        name: `[${data.code}] ${data.description}`,
        description: data.description,
        code: data.code,
        active: data.active,
        type: data.type,
        Company: {
          connect: { id: data.companyId.id },
        },
        InternalsFrom: {
          connect: data.internalIds.map((i) => ({ id: i.id })),
        },
        createdUid: uid || "",
      },
      include: {
        Company: {
          select: {
            id: true,
            name: true,
          },
        },
        InternalsFrom: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await createAuditlog({
      action: "create",
      entityId: newWarehouse.id,
      entityType: "warehouses",
      log: "Ha creado el registro",
    });

    return {
      success: true,
      message: "Se ha creado el almacén",
      data: newWarehouse,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function updateWarehouse({
  id,
  data,
}: {
  id: string | null;
  data: WarehouseActionProps;
}): Promise<ActionResponse<WarehouseWithProps>> {
  try {
    if (!id) throw new Error("ID not definded");

    const updatedWarehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        name: `[${data.code}] ${data.description}`,
        description: data.description,
        code: data.code,
        active: data.active,
        type: data.type,
        Company: {
          connect: { id: data.companyId.id },
        },
        InternalsFrom: {
          set: data.internalIds.map((i) => ({ id: i.id })),
        },
      },
      include: {
        Company: {
          select: {
            id: true,
            name: true,
          },
        },
        InternalsFrom: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await createAuditlog({
      action: "update",
      entityId: updatedWarehouse.id,
      entityType: "warehouses",
      log: "Ha editado el registro",
    });

    return {
      success: true,
      message: "Se ha editado el almacén",
      data: updatedWarehouse,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
