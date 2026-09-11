"use server";

import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import { InvoicingInvoice } from "@/generated/prisma/client";
import { InvoiceMoveSchemaType } from "../schemas/invoiceMove.schema";
import { getNextValue } from "@/app/libs/sequence";
import { sessionStore } from "@/app/libs/sessionStore";
import { format } from "date-fns";
import { createAuditlog } from "../../../actions/auditlog-actions";
import { round } from "@/app/libs/helpers";

export interface InvoiceMoveWithProps extends InvoicingInvoice {
  Partner: { id: string; name: string };
  PartnerShipping: { id: string; name: string } | null;
  PaymentTerm: { id: string; name: string };
  Currency: { id: string; name: string };
  Journal: { id: string; name: string; type: string };
  JournalEntry: { id: string; reference: string | null } | null;
  InvoiceLines: {
    id: string;
    amountTax: number;
    amountTotal: number;
    amountUntaxed: number;
    defaultCode: string | null;
    description: string;
    discountAmount: number;
    taxRate: number;
    discountPercent: number;
    priceUnit: number;
    Product: { id: string; name: string };
    productLastCost: number;
    quantity: number;
    Uom: { id: string; code: string };
    itemNumber: number;
  }[];
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
        Journal: { select: { id: true, name: true, type: true } },
        JournalEntry: { select: { id: true, reference: true } },
        Partner: { select: { id: true, name: true } },
        PartnerShipping: { select: { id: true, name: true } },
        PaymentTerm: { select: { id: true, name: true } },
        InvoiceLines: {
          select: {
            id: true,
            amountTax: true,
            amountTotal: true,
            amountUntaxed: true,
            defaultCode: true,
            description: true,
            discountAmount: true,
            taxRate: true,
            discountPercent: true,
            priceUnit: true,
            Product: { select: { id: true, name: true } },
            productLastCost: true,
            quantity: true,
            Uom: { select: { id: true, code: true } },
            itemNumber: true,
          },
        },
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
          state: data.state,
          currencyId: data.currencyId.id,
          journalId: data.journalId.id,
          partnerId: data.partnerId.id,
          partnerShippingId: data.partnerShippingId?.id ? data.partnerShippingId.id : null,
          displayType: data.displayType,
          invoiceDate: new Date(data.invoiceDate),
          invoiceDateDue: new Date(data.invoiceDateDue),
          paymentForm: data.paymentForm,
          paymentPolicy: data.paymentPolicy,
          paymentState: data.paymentState,
          cfdiUse: data.cfdiUse,
          reference: data.reference,
          subtotal: round(
            data.InvoiceLines.reduce((acc, line) => acc + line.amountUntaxed, 0),
            2,
          ),
          taxAmount: round(
            data.InvoiceLines.reduce((acc, line) => acc + line.amountTax, 0),
            2,
          ),
          total: round(
            data.InvoiceLines.reduce((acc, line) => acc + line.amountTotal, 0),
            2,
          ),
          paymentTermId: data.paymentTermId.id,
          uuidcfdi: data.uuidcfdi,
          InvoiceLines: {
            deleteMany: {
              id: {
                notIn: data.InvoiceLines.filter((line) => line.id).map((line) => line.id!),
              },
            },
            update: data.InvoiceLines.filter((line) => line.id).map((line) => ({
              where: {
                id: line.id!,
              },
              data: {
                amountTax: round(line.amountTax, 2),
                amountTotal: round(line.amountTotal, 2),
                amountUntaxed: round(line.amountUntaxed, 2),
                defaultCode: line.defaultCode,
                description: line.description,
                discountAmount: line.discountAmount,
                discountPercent: line.discountPercent,
                productId: line.productId.id,
                priceUnit: line.priceUnit,
                productLastCost: line.productLastCost,
                taxRate: line.taxRate,
                quantity: line.quantity,
                uomId: line.uomId.id,
                itemNumber: line.itemNumber,
              },
            })),
            createMany: {
              data: data.InvoiceLines.filter((line) => line.id === undefined).map((line) => ({
                amountTax: round(line.amountTax, 2),
                amountTotal: round(line.amountTotal, 2),
                amountUntaxed: round(line.amountUntaxed, 2),
                createUid: uid!,
                description: line.description,
                discountAmount: line.discountAmount,
                discountPercent: line.discountPercent,
                priceUnit: line.priceUnit,
                productId: line.productId.id,
                productLastCost: line.productLastCost,
                quantity: line.quantity,
                taxRate: line.taxRate,
                uomId: line.uomId.id,
                defaultCode: line.defaultCode,
                itemNumber: line.itemNumber,
              })),
            },
          },
        },
        create: {
          createUid: uid!,
          date: new Date(data.date),
          displayType: data.displayType,
          invoiceDate: new Date(data.invoiceDate),
          invoiceDateDue: new Date(data.invoiceDateDue),
          name: newName,
          paymentForm: data.paymentForm,
          paymentPolicy: data.paymentPolicy,
          paymentState: data.paymentState,
          cfdiUse: data.cfdiUse,
          reference: data.reference,
          subtotal: round(
            data.InvoiceLines.reduce((acc, line) => acc + line.amountUntaxed, 0),
            2,
          ),
          taxAmount: round(
            data.InvoiceLines.reduce((acc, line) => acc + line.amountTax, 0),
            2,
          ),
          total: round(
            data.InvoiceLines.reduce((acc, line) => acc + line.amountTotal, 0),
            2,
          ),
          uuidcfdi: data.uuidcfdi,
          currencyId: data.currencyId.id,
          journalId: data.journalId.id,
          partnerId: data.partnerId.id,
          partnerShippingId: data.partnerShippingId?.id ? data.partnerShippingId.id : null,
          paymentTermId: data.paymentTermId.id,
          InvoiceLines: {
            createMany: {
              data: data.InvoiceLines.map((line) => ({
                amountTax: round(line.amountTax, 2),
                amountTotal: round(line.amountTotal, 2),
                amountUntaxed: round(line.amountUntaxed, 2),
                createUid: uid!,
                description: line.description,
                discountAmount: line.discountAmount,
                discountPercent: line.discountPercent,
                priceUnit: line.priceUnit,
                productId: line.productId.id,
                productLastCost: line.productLastCost,
                quantity: line.quantity,
                taxRate: line.taxRate,
                uomId: line.uomId.id,
                defaultCode: line.defaultCode,
                itemNumber: line.itemNumber,
              })),
            },
          },
        },

        include: {
          Currency: { select: { id: true, name: true } },
          Journal: { select: { id: true, name: true, type: true } },
          JournalEntry: { select: { id: true, reference: true } },
          Partner: { select: { id: true, name: true } },
          PartnerShipping: { select: { id: true, name: true } },
          PaymentTerm: { select: { id: true, name: true } },
          InvoiceLines: {
            select: {
              id: true,
              amountTax: true,
              amountTotal: true,
              amountUntaxed: true,
              defaultCode: true,
              description: true,
              discountAmount: true,
              taxRate: true,
              discountPercent: true,
              priceUnit: true,
              Product: { select: { id: true, name: true } },
              productLastCost: true,
              quantity: true,
              Uom: { select: { id: true, code: true } },
              itemNumber: true,
            },
          },
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

// FORM ACTIONS

export async function actionInvoiceConfirm({ data }: { data: InvoiceMoveSchemaType }): Promise<ActionResponse<InvoiceMoveWithProps>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const invoiceRes = await actionInvoiceMove({
        data: { ...data, state: "confirmed" },
      });

      if (!invoiceRes.success || !invoiceRes.data) {
        throw new Error("Error al confirmar la factura");
      }

      const invoice = invoiceRes.data;

      const existingEntry = await tx.invoicingJournalEntry.findUnique({
        where: {
          invoiceId: invoice.id,
        },
      });

      if (existingEntry) {
        throw new Error("La factura ya tiene un asiento contable");
      }

      const lines =
        invoice.Journal.type === "sale"
          ? [
              {
                concept: "customer" as const,
                debit: invoice.total,
                credit: 0,
              },
              {
                concept: "sale" as const,
                debit: 0,
                credit: invoice.subtotal,
              },
              {
                concept: "vat" as const,
                debit: 0,
                credit: invoice.taxAmount,
              },
            ]
          : [
              {
                concept: "supplier" as const,
                debit: 0,
                credit: invoice.total,
              },
              {
                concept: "purchase" as const,
                debit: invoice.subtotal,
                credit: 0,
              },
              {
                concept: "vat" as const,
                debit: invoice.taxAmount,
                credit: 0,
              },
            ];

      await tx.invoicingJournalEntry.create({
        data: {
          journalId: invoice.journalId,
          invoiceId: invoice.id,
          reference: invoice.name,

          JournalLines: {
            create: lines,
          },
        },
      });

      return invoice;
    });

    return {
      success: true,
      message: "Factura confirmada",
      data: result,
    };
  } catch (error: any) {
    console.log(error);

    return {
      success: false,
      message: error.message,
    };
  }
}
