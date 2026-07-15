"use server";

import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import { sessionStore } from "@/app/libs/sessionStore";

export interface StockWarehouseActionProps {
  productId: string;
  warehouseId: {
    whId: string;
    companyOringId: string;
  };
  warehouseDestId: {
    whDestId: string;
    companyDestId: string;
  };
  qty: number;
  deliveredQty: number;
  ref: string;
  name: string;
}

export async function affectStockWarehouse({ data }: { data: StockWarehouseActionProps }): Promise<ActionResponse<boolean>> {
  try {
    const { uid, company } = await sessionStore();

    const sameCompany = data.warehouseId.companyOringId === company.id;

    await prisma.$transaction(async (tx) => {
      // ENTRADA
      const stocKIn = await tx.stockWarehouse.upsert({
        where: {
          productId_warehouseId: {
            productId: data.productId,
            warehouseId: data.warehouseDestId.whDestId,
          },
        },
        update: {
          qty: {
            increment: data.deliveredQty,
          },
        },
        create: {
          productId: data.productId,
          warehouseId: data.warehouseDestId.whDestId,
          qty: data.deliveredQty,
          createdUid: uid || "",
        },
      });

      const stockMoveIn = await tx.stockMove.create({
        data: {
          moveType: "incoming",
          reference: data.ref,
          name: data.name,
          productId: data.productId,
          userId: uid!,
          companyId: data.warehouseDestId.companyDestId,
          warehouseDestId: data.warehouseDestId.whDestId,
          warehouseId: data.warehouseId.whId,
          quantity: data.deliveredQty,
        },
      });

      // SALIDA
      const stockOut = await tx.stockWarehouse.update({
        where: {
          productId_warehouseId: {
            productId: data.productId,
            warehouseId: data.warehouseId.whId,
          },
        },
        data: {
          qty: {
            decrement: data.qty >= 0.1 ? data.deliveredQty : 0.0,
          },
          reservedQty: {
            decrement: data.qty,
          },
        },
      });

      // SI ES LA MISMA COMPAÑÍA DE SALIDA QUE LA DE ENTRADA, NO SE CREA LA SALIDA
      if (!sameCompany) {
        await tx.stockMove.create({
          data: {
            moveType: "outgoing",
            reference: data.ref,
            name: data.name,
            productId: data.productId,
            userId: uid!,
            companyId: data.warehouseId.companyOringId,
            warehouseDestId: data.warehouseDestId.whDestId,
            warehouseId: data.warehouseId.whId,
            quantity: data.deliveredQty,
          },
        });
      }

      return { stocKIn, stockMoveIn, stockOut };
    });

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

export async function stockWarehouseReserve({ data }: { data: { productId: { id: string; name: string }; qty: number; whId: string } }): Promise<ActionResponse<boolean>> {
  try {
    await prisma.stockWarehouse.update({
      where: {
        productId_warehouseId: {
          productId: data.productId.id,
          warehouseId: data.whId,
        },
      },
      data: {
        reservedQty: {
          increment: data.qty,
        },
      },
    });

    return {
      success: true,
      message: "Acción completada",
      data: true,
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

export async function stockWarehouseReserveCancel({ data }: { data: { productId: string; whId: string; qty: number } }): Promise<ActionResponse<boolean>> {
  try {
    await prisma.stockWarehouse.update({
      where: {
        productId_warehouseId: {
          productId: data.productId,
          warehouseId: data.whId,
        },
      },
      data: {
        reservedQty: {
          decrement: data.qty,
        },
      },
    });

    return {
      success: true,
      message: "Acción completada",
      data: true,
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}
