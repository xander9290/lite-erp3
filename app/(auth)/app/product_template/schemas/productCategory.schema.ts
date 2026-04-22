import { z } from "zod";

export const productCategorySchema = z.object({
  name: z.string(),
  description: z.string().min(1, "Descripción es requerido"),
  parentId: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
});

export type ProductCategorySchemaType = z.infer<typeof productCategorySchema>;

export const productCategorySchemaDefault: ProductCategorySchemaType = {
  name: "",
  description: "",
  parentId: {
    id: "",
    name: "",
  },
};
