"use server";

import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import { sessionStore } from "@/app/libs/sessionStore";

export interface StockWarehouseActionProps {
  productId: string;
  warehouseId: string;
  warehouseDestId: string;
  qty: number;
  ref: string;
  name: string;
}

export async function affectStockWarehouse({
  data,
}: {
  data: StockWarehouseActionProps[];
}): Promise<ActionResponse<true>> {
  try {
    const { uid, company } = await sessionStore();

    for (const line of data) {
      await prisma.$transaction(async (tx) => {
        // ENTRADA
        const stocKIn = await tx.stockWarehouse.upsert({
          where: {
            productId_warehouseId: {
              productId: line.productId,
              warehouseId: line.warehouseDestId,
            },
          },
          update: {
            qty: {
              increment: line.qty,
            },
          },
          create: {
            productId: line.productId,
            warehouseId: line.warehouseDestId,
            qty: line.qty,
            createdUid: uid || "",
          },
        });

        const stockMoveIn = await tx.stockMove.create({
          data: {
            moveType: "incoming",
            reference: line.ref,
            name: line.name,
            productId: line.productId,
            userId: uid!,
            companyId: company.id,
            warehouseDestId: line.warehouseDestId,
            warehouseId: line.warehouseId,
            quantity: line.qty,
          },
        });

        // SALIDA
        const stockOut = await tx.stockWarehouse.update({
          where: {
            productId_warehouseId: {
              productId: line.productId,
              warehouseId: line.warehouseId,
            },
          },
          data: {
            qty: {
              decrement: line.qty,
            },
            reservedQty: {
              decrement: line.qty,
            },
          },
        });

        const stockMoveOut = await tx.stockMove.create({
          data: {
            moveType: "outgoing",
            reference: line.ref,
            name: line.name,
            productId: line.productId,
            userId: uid!,
            companyId: company.id,
            warehouseDestId: line.warehouseDestId,
            warehouseId: line.warehouseId,
            quantity: line.qty,
          },
        });

        return { stocKIn, stockMoveIn, stockOut, stockMoveOut };
      });
    }

    return {
      success: true,
      message: "Se ha completado el proceso",
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
