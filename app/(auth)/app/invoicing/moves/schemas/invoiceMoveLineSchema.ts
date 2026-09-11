import { todayDate } from "@/app/libs/validatorDate";
import { z } from "zod";

export const invoiceMoveLineSchema = z.object({
  id: z.string().optional(),
  quantity: z.number(),
  priceUnit: z.number(),
  discountPercent: z.number(),
  discountAmount: z.number(),
  amountUntaxed: z.number(),
  amountTax: z.number(),
  amountTotal: z.number(),
  taxRate: z.number(),
  productLastCost: z.number(),
  defaultCode: z.string(),
  description: z.string(),
  productId: z.object({
    id: z.string().min(1, "El producto es requerido"),
    name: z.string(),
  }),
  uomId: z.object({
    id: z.string(),
    name: z.string(),
  }),
  itemNumber: z.number(),
});

export type InvoiceMoveLineSchemaType = z.infer<typeof invoiceMoveLineSchema>;

export const invoiceMoveLineSchemaDefault: InvoiceMoveLineSchemaType = {
  amountTax: 0.0,
  amountTotal: 0.0,
  amountUntaxed: 0.0,
  defaultCode: "",
  description: "",
  discountAmount: 0.0,
  taxRate: 0.0,
  discountPercent: 0.0,
  priceUnit: 0.0,
  productId: { id: "", name: "" },
  productLastCost: 0.0,
  quantity: 1.0,
  uomId: { id: "", name: "" },
  itemNumber: 0,
};
