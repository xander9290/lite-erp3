import { TaxTypeUse } from "@/generated/prisma/enums";
import { z } from "zod";

export const invoicingTaxSchema = z.object({
  name: z.string(),
  description: z.string(),
  amount: z.number(),
  active: z.boolean(),
  typeUse: z.enum(TaxTypeUse),
});

export type InvoicinTaxSchemaType = z.infer<typeof invoicingTaxSchema>;

export const invoicingTaxSchemaDefault: InvoicinTaxSchemaType = {
  name: "",
  description: "",
  amount: 0.0,
  active: true,
  typeUse: "sale",
};
