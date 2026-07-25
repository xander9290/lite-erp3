import { InvoiceDisplayType, InvoicePaymentForm, InvoicePaymentPolicy, InvoiceState, InvoiceType } from "@/generated/prisma/enums";
import { z } from "zod";

export const invoiceMoveSchema = z.object({
  name: z.string(),
  ref: z.string(),
  date: z.iso.date(),
  invoiceDate: z.iso.date(),
  invoiceDateDue: z.iso.date(),
  displayType: z.enum(InvoiceDisplayType),
  invoiceType: z.enum(InvoiceType),
  state: z.enum(InvoiceState),
  uuidcfdi: z.string(),
  subtotal: z.number(),
  taxAmount: z.number(),
  total: z.number(),
  paymentPolicy: z.enum(InvoicePaymentPolicy),
  paymentForm: z.enum(InvoicePaymentForm),
});

export type InvoiceMoveSchemaType = z.infer<typeof invoiceMoveSchema>;

export const invoiceMoveSchemaDefault: InvoiceMoveSchemaType = {};
