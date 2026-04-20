import { ProductDisplayType } from "@/generated/prisma/enums";
import { z } from "zod";

export const productTemplateSchema = z.object({
  name: z.string(),
  description: z.string().min(1, "Descripción es requerido"),
  defaultCode: z.string().min(1, "Referencia interna es requerido"),
  active: z.boolean(),
  sales: z.boolean(),
  purchases: z.boolean(),
  displayType: z.enum(ProductDisplayType),
  imageUrl: z.string().nullable(),
  price1: z.number(),
  price2: z.number(),
  price3: z.number(),
  price4: z.number(),
  price5: z.number(),
  lastCost: z.number(),
  weight: z.number(),
  volume: z.number(),
  ancho: z.number(),
  alto: z.number(),
  largo: z.number(),
  uomIncomingAllowed: z.number(),
  uomOutgoingAllowed: z.number(),
  supplierId: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  userId: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  Tags: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
  createdUid: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type ProductTemplateSchemaType = z.infer<typeof productTemplateSchema>;

export const productTemplateSchemaDefault: ProductTemplateSchemaType = {
  name: "",
  description: "",
  defaultCode: "",
  active: true,
  sales: true,
  purchases: true,
  displayType: "PRODUCT",
  imageUrl: "",
  lastCost: 0,
  price1: 0,
  price2: 0,
  price3: 0,
  price4: 0,
  price5: 0,
  alto: 0,
  ancho: 0,
  largo: 0,
  weight: 0,
  volume: 0,
  supplierId: { id: "", name: "" },
  userId: { id: "", name: "" },
  uomIncomingAllowed: 0,
  uomOutgoingAllowed: 0,
  Tags: [],
  createdAt: null,
  createdUid: null,
  updatedAt: null,
};
