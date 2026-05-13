import { z } from "zod";

export const UomSchema = z.object({
  name: z.string(),
  description: z.string().min(1, "Clave es requerida"),
  code: z.string().min(1, "Código es requerido"),
  ratio: z.number(),
  isBaseUnit: z.boolean(),
  active: z.boolean(),
  Products: z.array(
    z.object({
      name: z.string(),
      id: z.string(),
    }),
  ),
  createdUid: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type UomSchemaType = z.infer<typeof UomSchema>;

export const uomSchemaDefault: UomSchemaType = {
  name: "",
  description: "",
  code: "",
  ratio: 0.0,
  isBaseUnit: false,
  active: true,
  Products: [],
  createdUid: null,
  createdAt: null,
  updatedAt: null,
};
