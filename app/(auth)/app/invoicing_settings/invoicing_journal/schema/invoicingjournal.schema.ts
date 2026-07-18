import { JournalType } from "@/generated/prisma/browser";
import { z } from "zod";

export const invoicingJournalSchema = z.object({
  name: z.string(),
  code: z.string().min(1, "El campo código es requerido"),
  type: z.enum(JournalType),
  active: z.boolean(),
  companyId: z.object({
    id: z.string().min(1, "Empresa es requerido"),
    name: z.string(),
  }),
  currencyId: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
    })
    .nullable(),
});

export type InvoicingJournalSchemaType = z.infer<typeof invoicingJournalSchema>;

export const invoicingJournalSchemaDefault: InvoicingJournalSchemaType = {
  name: "",
  active: true,
  code: "",
  companyId: { id: "", name: "" },
  currencyId: { id: "", name: "" },
  type: "sale",
};
