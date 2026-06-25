"use server";

import prisma from "@/app/libs/prisma";
import { ICurrencySchema } from "../schemas/icurrency.schema";
import { ActionResponse } from "@/app/libs/definitions";
import type { InvoicingCurrency } from "@/generated/prisma/client";

export async function getCurrencyById({
  id,
}: {
  id: string | null;
}): Promise<ICurrencySchema | null> {
  try {
    if (!id) throw new Error("ID not defined");

    const icurrency = await prisma.invoicingCurrency.findUnique({
      where: { id },
    });

    return icurrency;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createCurrency({
  data,
}: {
  data: ICurrencySchema;
}): Promise<ActionResponse<InvoicingCurrency>> {
  try {
    const newCurrency = await prisma.invoicingCurrency.create({
      data,
    });

    return {
      message: "Se ha creado el registro",
      success: true,
      data: newCurrency,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function updateCurrency({
  id,
  data,
}: {
  id: string | null;
  data: ICurrencySchema;
}): Promise<ActionResponse<ICurrencySchema>> {
  try {
    if (!id) throw new Error("ID not defined");

    const updatedCurrency = await prisma.invoicingCurrency.update({
      where: { id },
      data,
    });

    return {
      message: "Se ha editado el registro",
      success: true,
      data: updatedCurrency,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
