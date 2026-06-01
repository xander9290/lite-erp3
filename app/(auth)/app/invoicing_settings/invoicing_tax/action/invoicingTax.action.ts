"use server";

import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import type { InvoicingTax } from "@/generated/prisma/client";
import { InvoicinTaxSchemaType } from "../schemas/invoicingTax.schema";
import { sessionStore } from "@/app/libs/sessionStore";
import { createAuditlog } from "../../../actions/auditlog-actions";

export async function getInvoicingTaxById({ id }: { id: string | null }): Promise<InvoicingTax | null> {
  try {
    if (!id) throw new Error("ID not defined");

    const invoicingTax = await prisma.invoicingTax.findUnique({
      where: { id },
    });

    return invoicingTax;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createInvoicingTax({ data }: { data: InvoicinTaxSchemaType }): Promise<ActionResponse<InvoicingTax>> {
  try {
    const { uid } = await sessionStore();

    const newInvoicingTax = await prisma.invoicingTax.create({
      data: {
        ...data,
        name: `[${data.name}] ${data.description}`,
        createUid: uid || "",
      },
    });

    await createAuditlog({
      action: "create",
      entityId: newInvoicingTax.id,
      entityType: "invoicingTax",
      log: "Ha creado el registro",
    });

    return {
      success: true,
      message: "Se ha creado el registro",
      data: newInvoicingTax,
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

export async function updateInvoicingTax({ data, id }: { id: string | null; data: InvoicinTaxSchemaType }): Promise<ActionResponse<InvoicingTax>> {
  try {
    if (!id) throw new Error("ID not defined");
    const newInvoicingTax = await prisma.invoicingTax.update({
      where: { id },
      data: {
        ...data,
      },
    });

    await createAuditlog({
      action: "update",
      entityId: newInvoicingTax.id,
      entityType: "invoicingTax",
      log: "Ha editado el registro",
    });

    return {
      success: true,
      message: "Se ha editado el registro",
      data: newInvoicingTax,
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}
