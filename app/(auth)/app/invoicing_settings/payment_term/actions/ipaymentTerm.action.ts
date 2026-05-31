"use server";

import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import type { InvoicingPaymentTerm } from "@/generated/prisma/client";
import { IPaymentTermSchemaType } from "../schema/ipaymentTerm.schema";
import { sessionStore } from "@/app/libs/sessionStore";
import { createAuditlog } from "../../../actions/auditlog-actions";

export async function getIPaymentTermById({ id }: { id: string | null }): Promise<InvoicingPaymentTerm | null> {
  try {
    if (!id) throw new Error("ID not defined");
    const paymentTerm = await prisma.invoicingPaymentTerm.findUnique({
      where: { id },
    });
    return paymentTerm;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createIPaymentTerm({ data }: { data: IPaymentTermSchemaType }): Promise<ActionResponse<InvoicingPaymentTerm>> {
  try {
    const { uid } = await sessionStore();
    const newPaymentTerm = await prisma.invoicingPaymentTerm.create({
      data: {
        ...data,
        createUid: uid || "",
      },
    });

    await createAuditlog({
      action: "create",
      entityId: newPaymentTerm.id,
      entityType: "invoicingPaymentTerm",
      log: "Ha creado el registro",
    });

    return {
      success: true,
      message: "Se ha creado el registro",
      data: newPaymentTerm,
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

export async function updateIPaymentTerm({ id, data }: { id: string | null; data: IPaymentTermSchemaType }): Promise<ActionResponse<InvoicingPaymentTerm>> {
  try {
    if (!id) throw new Error("ID not defined");

    const updatedPaymentTerm = await prisma.invoicingPaymentTerm.update({
      where: { id },
      data,
    });

    await createAuditlog({
      action: "update",
      entityId: updatedPaymentTerm.id,
      entityType: "invoicingPaymentTerm",
      log: "Ha editado el registro",
    });

    return {
      success: true,
      message: "Se ha creado el registro",
      data: updatedPaymentTerm,
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}
