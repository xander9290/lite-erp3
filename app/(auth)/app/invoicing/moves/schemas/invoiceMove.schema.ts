import { todayDate } from "@/app/libs/validatorDate";
import {
  CfdiUse,
  InvoiceDisplayType,
  InvoicePaymentForm,
  InvoicePaymentPolicy,
  InvoiceState,
} from "@/generated/prisma/enums";
import { z } from "zod";
import { invoiceMoveLineSchema } from "./invoiceMoveLineSchema";

export const invoiceMoveSchema = z.object({
  name: z.string(),
  reference: z.string(),
  date: z.iso.date(),
  invoiceDate: z.iso.date(),
  invoiceDateDue: z.iso.date(),
  displayType: z.enum(InvoiceDisplayType),
  state: z.enum(InvoiceState),
  uuidcfdi: z.string(),
  subtotal: z.number(),
  taxAmount: z.number(),
  total: z.number(),
  paymentPolicy: z.enum(InvoicePaymentPolicy),
  paymentForm: z.enum(InvoicePaymentForm),
  cfdiUse: z.enum(CfdiUse),
  paymentTermId: z.object({
    id: z.string(),
    name: z.string(),
  }),
  partnerId: z.object({
    id: z.string(),
    name: z.string(),
  }),
  partnerShippingId: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
    })
    .nullable(),
  currencyId: z.object({
    id: z.string(),
    name: z.string(),
  }),
  journalId: z.object({
    id: z.string(),
    name: z.string(),
  }),
  InvoiceLines: z.array(invoiceMoveLineSchema),
});

export type InvoiceMoveSchemaType = z.infer<typeof invoiceMoveSchema>;

export const invoiceMoveSchemaDefault: InvoiceMoveSchemaType = {
  currencyId: { id: "", name: "" },
  date: todayDate(),
  displayType: "customer",
  invoiceDate: todayDate(),
  invoiceDateDue: "",
  journalId: { id: "", name: "" },
  name: "new",
  partnerId: { id: "", name: "" },
  partnerShippingId: { id: "", name: "" },
  paymentForm: "undefined",
  paymentPolicy: "PPD",
  cfdiUse: "noTaxEffects",
  paymentTermId: { id: "", name: "" },
  reference: "",
  state: "draft",
  subtotal: 0.0,
  taxAmount: 0.0,
  total: 0.0,
  uuidcfdi: "",
  InvoiceLines: [],
};
