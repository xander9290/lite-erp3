"use server";

import prisma from "@/app/libs/prisma";
import { SaleShippingWay } from "@/generated/prisma/client";
import { SaleShippingWaySchemaType } from "../schemas/saleShippingWay.schema";
import { ActionResponse } from "@/app/libs/definitions";

export async function getSaleShippingWayById({ id }: { id: string | null }): Promise<SaleShippingWay | null> {
  try {
    if (!id) throw new Error("ID not defined");

    const saleShippingWay = await prisma.saleShippingWay.findUnique({
      where: { id },
    });

    return saleShippingWay;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createSaleShippingWay({ data }: { data: SaleShippingWaySchemaType }): Promise<ActionResponse<SaleShippingWay>> {
  try {
    const saleShippingWay = await prisma.saleShippingWay.create({
      data: {
        name: data.name,
        type: data.type,
        active: data.active,
      },
    });

    return {
      success: true,
      message: "Se ha completado la acción",
      data: saleShippingWay,
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

export async function updateSaleShippingWay({ id, data }: { id: string | null; data: SaleShippingWaySchemaType }): Promise<ActionResponse<SaleShippingWay>> {
  try {
    if (!id) throw new Error("ID not defined");
    const saleShippingWay = await prisma.saleShippingWay.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        active: data.active,
      },
    });

    return {
      success: true,
      message: "Se ha completado la acción",
      data: saleShippingWay,
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}
