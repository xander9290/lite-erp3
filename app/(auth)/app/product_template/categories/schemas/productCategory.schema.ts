import { z } from "zod";

export const productCategorySchema = z.object({
  name: z.string(),
  description: z.string().min(1, "Descripción es requerido"),
  active: z.boolean(),
  parentId: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  createdUid: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type ProductCategorySchemaType = z.infer<typeof productCategorySchema>;

export const productCategorySchemaDefault: ProductCategorySchemaType = {
  name: "",
  description: "",
  active: true,
  parentId: {
    id: "",
    name: "",
  },
  createdAt: null,
  createdUid: null,
  updatedAt: null,
};
