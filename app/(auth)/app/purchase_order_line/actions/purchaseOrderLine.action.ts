"use server";

import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import type { PurchaseOrderLine } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

export async function updatePOLineReceivedQty({
  id,
  qty,
}: {
  id: string;
  qty: number;
}): Promise<ActionResponse<PurchaseOrderLine>> {
  try {
    if (!id) throw new Error("ID not defined");

    if (qty < 0.0)
      throw new Error("La cantidad recibida no debe ser menor a cero");

    const getLine = await prisma.purchaseOrderLine.findFirst({
      where: { id },
    });

    if (getLine) {
      const currentQty = getLine.quantity;
      if (qty > currentQty)
        throw new Error("La cantidad recibida no debe sey mayor a la ordenada");
    }

    const updateQty = await prisma.purchaseOrderLine.update({
      where: { id },
      data: {
        receivedQty: qty,
      },
    });

    return {
      success: true,
      message: "Se ha editado la cantidad recibida",
      data: updateQty,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
