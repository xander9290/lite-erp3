"use server";

import type { Manufacturing } from "@/generated/prisma/client";
import { ManufacturingSchemaType } from "../schemas/manufacturing.schema";
import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import { sessionStore } from "@/app/libs/sessionStore";
import { getNextValue } from "@/app/libs/sequence";
import { round, serverLog } from "@/app/libs/helpers";
import { createAuditlog } from "../../actions/auditlog-actions";

export interface ManufacturingWithProps extends Manufacturing {
  Product: { id: string; name: string };
  Uom: { id: string; name: string };
  Company: { id: string; name: string };
  WhOrigin: { id: string; name: string };
  WhDest: { id: string; name: string };
  ManufacturingLines: {
    id: string;
    outQty: number;
    priceUnit: number;
    Manufacturing: { id: string; name: string };
    Product: { id: string; name: string };
    Uom: { id: string; name: string };
  }[];
}

export type ManufacturingActionProps = Omit<ManufacturingSchemaType, "createdAt" | "createdUid" | "updatedAt">;

export async function getManufacturingById({ id }: { id: string | null }): Promise<ManufacturingWithProps | null> {
  try {
    if (!id) throw new Error("ID not defined");
    const manufacturing = await prisma.manufacturing.findUnique({
      where: { id },
      include: {
        Product: {
          select: { id: true, name: true },
        },
        Uom: { select: { id: true, name: true } },
        Company: {
          select: { id: true, name: true },
        },
        WhOrigin: {
          select: { id: true, name: true, code: true },
        },
        WhDest: {
          select: { id: true, name: true },
        },
        ManufacturingLines: {
          select: {
            id: true,
            outQty: true,
            priceUnit: true,
            Manufacturing: { select: { id: true, name: true } },
            Product: { select: { id: true, name: true } },
            Uom: { select: { id: true, name: true } },
          },
        },
      },
    });

    return manufacturing;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createManufacturing({ data }: { data: ManufacturingActionProps }): Promise<ActionResponse<ManufacturingWithProps>> {
  try {
    serverLog({ action: "Creating", model: "manufacturint", data });
    const { uid, company } = await sessionStore();

    const name = await getNextValue(`MF/${company.code}/`, `${company.code}-manufacturing`);
    const newManufacturing = await prisma.manufacturing.create({
      data: {
        name,
        productId: data.productId.id,
        quantity: data.quantity,
        yield: data.yield,
        uomId: data.uomId.id,
        companyId: company.id,
        whOriginId: data.whOriginId.id,
        whDestId: data.whDestId.id,
        state: data.state,
        ManufacturingLines: {
          createMany: {
            data: data.ManufacturingLines.map((line) => ({
              productIngredientId: line.productIngredientId.id,
              outQty: line.outQty,
              priceUnit: line.priceUnit * line.outQty,
              uomId: line.uomId.id,
              createUid: uid || "",
            })),
          },
        },
        createUid: uid || "",
      },
      include: {
        Product: {
          select: { id: true, name: true },
        },
        Uom: { select: { id: true, name: true } },
        Company: {
          select: { id: true, name: true },
        },
        WhOrigin: {
          select: { id: true, name: true, code: true },
        },
        WhDest: {
          select: { id: true, name: true },
        },
        ManufacturingLines: {
          select: {
            id: true,
            outQty: true,
            priceUnit: true,
            Manufacturing: { select: { id: true, name: true } },
            Product: { select: { id: true, name: true } },
            Uom: { select: { id: true, name: true } },
          },
        },
      },
    });

    await calcIngridientPriceUnit({ manufacturingId: newManufacturing.id });

    await createAuditlog({
      action: "create",
      entityId: newManufacturing.id,
      entityType: "manufacturing",
      log: "Ha creado el registro",
    });

    return {
      success: true,
      message: "Se ha creado el registro",
      data: newManufacturing,
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

export async function updateManufacturing({ id, data }: { id: string | null; data: ManufacturingActionProps }): Promise<ActionResponse<ManufacturingWithProps>> {
  try {
    if (!id) throw new Error("ID not defined");

    const { uid, company } = await sessionStore();

    const updatedManufacturing = await prisma.manufacturing.update({
      where: { id },
      data: {
        productId: data.productId.id,
        quantity: data.quantity,
        yield: data.yield,
        uomId: data.uomId.id,
        companyId: company.id,
        whOriginId: data.whOriginId.id,
        whDestId: data.whDestId.id,
        state: data.state,
        ManufacturingLines: {
          deleteMany: {
            id: {
              notIn: data.ManufacturingLines.filter((l) => l.id).map((l) => l.id!),
            },
          },
          upsert: data.ManufacturingLines.map((line) => ({
            where: { id: line.id ?? "" },
            update: {
              productIngredientId: line.productIngredientId.id,
              outQty: line.outQty,
              priceUnit: line.priceUnit * line.outQty,
              uomId: line.uomId.id,
            },
            create: {
              productIngredientId: line.productIngredientId.id,
              outQty: line.outQty,
              priceUnit: line.priceUnit * line.outQty,
              uomId: line.uomId.id,
              createUid: uid || "",
            },
          })),
        },
        createUid: uid || "",
      },
      include: {
        Product: {
          select: { id: true, name: true },
        },
        Uom: { select: { id: true, name: true } },
        Company: {
          select: { id: true, name: true },
        },
        WhOrigin: {
          select: { id: true, name: true, code: true },
        },
        WhDest: {
          select: { id: true, name: true },
        },
        ManufacturingLines: {
          select: {
            id: true,
            outQty: true,
            priceUnit: true,
            Manufacturing: { select: { id: true, name: true } },
            Product: { select: { id: true, name: true } },
            Uom: { select: { id: true, name: true } },
          },
        },
      },
    });

    await calcIngridientPriceUnit({ manufacturingId: updatedManufacturing.id });

    await createAuditlog({
      action: "update",
      entityId: updatedManufacturing.id,
      entityType: "manufacturing",
      log: "Ha editado el registro",
    });

    return {
      success: true,
      message: "Se ha creado el registro",
      data: updatedManufacturing,
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

export async function manufacturingActionProcess({ data }: { data: ManufacturingActionProps }): Promise<ActionResponse<boolean>> {
  try {
    await prisma.$transaction(async (tx) => {
      for (const line of data.ManufacturingLines) {
        //VALIDAR LA DISPONIBILIDAD DEL INSUMO
        console.log(line);
        const getStock = await tx.stockWarehouse.findUnique({
          where: {
            productId_warehouseId: {
              productId: line.productIngredientId.id,
              warehouseId: data.whOriginId.id,
            },
          },
          select: {
            qty: true,
            reservedQty: true,
            Product: {
              include: {
                Uom: {
                  select: {
                    code: true,
                  },
                },
              },
            },
          },
        });

        if (!getStock) throw new Error(`${line.productIngredientId.name} no cuenta con existencia actual.`);

        const qtyAvailabe = round(getStock.qty - getStock.reservedQty, 2);
        if (qtyAvailabe < line.outQty) throw new Error(`${line.productIngredientId.name} no cuenta con disponibilidad suficiente. Cantidad disponible: ${qtyAvailabe} ${getStock.Product.Uom?.code}`);

        await tx.stockWarehouse.update({
          where: {
            productId_warehouseId: {
              productId: line.productIngredientId.id,
              warehouseId: data.whOriginId.id,
            },
          },
          data: {
            reservedQty: {
              increment: line.outQty,
            },
          },
        });
      }
    });

    return {
      success: true,
      message: "Proceso completado",
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

export async function manufacturingActionFinish({ data }: { data: ManufacturingActionProps }): Promise<ActionResponse<boolean>> {
  try {
    const { uid, company } = await sessionStore();

    await prisma.$transaction(async (tx) => {
      for (const line of data.ManufacturingLines) {
        await tx.stockWarehouse.update({
          where: {
            productId_warehouseId: {
              productId: line.productIngredientId.id,
              warehouseId: data.whOriginId.id,
            },
          },
          data: {
            reservedQty: {
              decrement: line.outQty,
            },
            qty: {
              decrement: line.outQty,
            },
          },
        });

        await tx.stockMove.create({
          data: {
            moveType: "outgoing",
            name: "FABRICACIÓN",
            reference: data.name,
            warehouseId: data.whOriginId.id,
            warehouseDestId: data.whDestId.id,
            productId: line.productIngredientId.id,
            quantity: line.outQty,
            userId: uid!,
            companyId: company.id,
          },
        });
      }
    });
    return {
      success: true,
      message: "Se ha completado el proceso",
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

export async function manufacturingActionAffect({ data }: { data: ManufacturingActionProps }): Promise<ActionResponse<boolean>> {
  try {
    const { uid, company } = await sessionStore();

    await prisma.$transaction(async (tx) => {
      await tx.stockWarehouse.upsert({
        where: {
          productId_warehouseId: {
            productId: data.productId.id,
            warehouseId: data.whDestId.id,
          },
        },
        update: {
          qty: {
            increment: data.yield,
          },
        },
        create: {
          productId: data.productId.id,
          warehouseId: data.whDestId.id,
          qty: data.yield,
          createdUid: uid!,
        },
      });

      await tx.stockMove.create({
        data: {
          moveType: "incoming",
          name: "FABRICACIÓN",
          reference: data.name,
          warehouseId: data.whOriginId.id,
          warehouseDestId: data.whDestId.id,
          productId: data.productId.id,
          quantity: data.yield,
          userId: uid!,
          companyId: company.id,
        },
      });
    });

    return {
      success: true,
      message: "Se ha completado el proceso",
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

export async function manufacturingActionCancel({ data }: { data: ManufacturingActionProps }): Promise<ActionResponse<boolean>> {
  try {
    for (const line of data.ManufacturingLines) {
      await prisma.stockWarehouse.update({
        where: {
          productId_warehouseId: {
            productId: line.productIngredientId.id,
            warehouseId: data.whOriginId.id,
          },
        },
        data: {
          reservedQty: {
            decrement: line.outQty,
          },
        },
      });
    }
    return {
      success: true,
      message: "Se ha completado el proceso",
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

export const calcIngridientPriceUnit = async ({ manufacturingId }: { manufacturingId: string }) => {
  await prisma.$transaction(async (tx) => {
    // extraer las líneas de la orden
    const lines = await tx.manufacturingLine.findMany({
      where: {
        manufacturingId,
      },
      include: {
        Product: {
          select: { id: true, lastCost: true },
        },
      },
    });

    // costo de producción
    let priceUnitManufacturing = 0.0;

    // cálculo de cantidades
    for (const line of lines) {
      await tx.manufacturingLine.update({
        where: {
          id: line.id,
        },
        data: {
          priceUnit: line.outQty * line.Product.lastCost,
        },
      });

      priceUnitManufacturing += round(line.outQty * line.Product.lastCost, 2);
    }

    // se calcula el costo de la producción
    await tx.manufacturing.update({
      where: {
        id: manufacturingId,
      },
      data: {
        priceUnit: priceUnitManufacturing,
      },
    });
  });
};
