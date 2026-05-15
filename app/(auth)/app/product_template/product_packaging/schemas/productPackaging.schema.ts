import { z } from "zod";

export const productPackagingSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  active: z.boolean(),
  packagingLine: z.array(
    z.object({
      id: z.string(),
      qty: z.number(),
      packagingId: z.object({ id: z.string(), name: z.string() }),
      productId: z.object({ id: z.string(), name: z.string() }),
    }),
  ),
  createdUid: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type ProductPackagingSchemaType = z.infer<typeof productPackagingSchema>;

export const productPackagingSchemaDefault: ProductPackagingSchemaType = {
  name: "",
  active: true,
  packagingLine: [],
  createdUid: null,
  createdAt: null,
  updatedAt: null,
};
