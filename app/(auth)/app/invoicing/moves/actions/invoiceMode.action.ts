"use server";

import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import { InvoicingInvoice } from "@/generated/prisma/client";
import { InvoiceMoveSchemaType } from "../schemas/invoiceMove.schema";
import { getNextValue } from "@/app/libs/sequence";
import { sessionStore } from "@/app/libs/sessionStore";
import { format } from "date-fns";
import { createAuditlog } from "../../../actions/auditlog-actions";

export interface InvoiceMoveWithProps extends InvoicingInvoice {
  Partner: { id: string; name: string };
  PartnerShipping: { id: string; name: string } | null;
  PaymentTerm: { id: string; name: string };
  Currency: { id: string; name: string };
  Journal: { id: string; name: string };
  JournalEntry: { id: string; reference: string | null } | null;
}

export async function getInvoiceMoveById({ id }: { id: string | null }): Promise<InvoiceMoveWithProps | null> {
  try {
    if (!id) throw new Error("ID move not defined");

    const invoiceMove = await prisma.invoicingInvoice.findUnique({
      where: {
        id,
      },
      include: {
        Currency: { select: { id: true, name: true } },
        Journal: { select: { id: true, name: true } },
        JournalEntry: { select: { id: true, reference: true } },
        Partner: { select: { id: true, name: true } },
        PartnerShipping: { select: { id: true, name: true } },
        PaymentTerm: { select: { id: true, name: true } },
      },
    });

    return invoiceMove;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function actionInvoiceMove({ data }: { data: InvoiceMoveSchemaType }): Promise<ActionResponse<InvoiceMoveWithProps>> {
  try {
    const { uid } = await sessionStore();

    const action = await prisma.$transaction(async (tx) => {
      const journal = await tx.invoicingJournal.findUnique({
        where: { id: data.journalId.id },
      });

      if (!journal) throw new Error("Diario no encontrado");

      let newName = "";
      if (data.name === "new") {
        newName = await getNextValue(`${journal.code}/${format(new Date(), "yyyy")}/`, `${journal.name}-invoicing`);
      }

      const invoiceMove = await tx.invoicingInvoice.upsert({
        where: {
          name: data.name,
        },
        update: {
          currencyId: data.currencyId.id,
          journalId: data.journalId.id,
          partnerId: data.partnerId.id,
          partnerShippingId: data.partnerShippingId?.id ? data.partnerShippingId.id : null,
          displayType: data.displayType,
          invoiceDate: new Date(data.invoiceDate),
          invoiceDateDue: new Date(data.invoiceDateDue),
          paymentForm: data.paymentForm,
          paymentPolicy: data.paymentPolicy,
          cfdiUse: data.cfdiUse,
          reference: data.reference,
          subtotal: data.subtotal,
          taxAmount: data.taxAmount,
          total: data.total,
          paymentTermId: data.paymentTermId.id,
          uuidcfdi: data.uuidcfdi,
        },
        create: {
          createUid: uid!,
          date: new Date(data.date),
          displayType: data.displayType,
          invoiceDate: new Date(data.invoiceDate),
          invoiceDateDue: new Date(data.invoiceDateDue),
          invoiceType: data.invoiceType,
          name: newName,
          paymentForm: data.paymentForm,
          paymentPolicy: data.paymentPolicy,
          cfdiUse: data.cfdiUse,
          reference: data.reference,
          subtotal: data.subtotal,
          taxAmount: data.taxAmount,
          total: data.total,
          uuidcfdi: data.uuidcfdi,
          currencyId: data.currencyId.id,
          journalId: data.journalId.id,
          partnerId: data.partnerId.id,
          partnerShippingId: data.partnerShippingId?.id ? data.partnerShippingId.id : null,
          paymentTermId: data.paymentTermId.id,
        },

        include: {
          Currency: { select: { id: true, name: true } },
          Journal: { select: { id: true, name: true } },
          JournalEntry: { select: { id: true, reference: true } },
          Partner: { select: { id: true, name: true } },
          PartnerShipping: { select: { id: true, name: true } },
          PaymentTerm: { select: { id: true, name: true } },
        },
      });

      if (invoiceMove) {
        if (data.name === "new") {
          await createAuditlog({
            action: "create",
            entityId: invoiceMove.id,
            entityType: "invoicingInvoice",
            log: "Ha creado el registro",
          });
        } else {
          await createAuditlog({
            action: "update",
            entityId: invoiceMove.id,
            entityType: "invoicingInvoice",
            log: "Ha editado el registro",
          });
        }
      }

      return invoiceMove;
    });

    return {
      message: "Operación completada",
      success: true,
      data: action,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
