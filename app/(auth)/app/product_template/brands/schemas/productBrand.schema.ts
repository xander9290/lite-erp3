import { z } from "zod";

export const productBrandSchema = z.object({
  name: z.string(),
  code: z.string(),
  description: z.string().min(1, "Descripción es requerido"),
  active: z.boolean(),
  Products: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
  createdUid: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type ProductBrandSchemaType = z.infer<typeof productBrandSchema>;

export const productBrandSchemaDefault: ProductBrandSchemaType = {
  name: "",
  code: "",
  description: "",
  active: true,
  Products: [],
  createdUid: "",
  createdAt: null,
  updatedAt: null,
};
