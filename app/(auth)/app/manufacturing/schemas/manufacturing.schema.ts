import { ManufacturingState } from "@/generated/prisma/enums";
import { z } from "zod";

export const manufacturingLineSchema = z.object({
  id: z.string().optional(),
  outQty: z.number(),
  productIngredientId: z.object({
    id: z.string().min(1, "Producto ingrediente es requerido"),
    name: z.string(),
  }),
  uomId: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

export const manufacturingSchema = z.object({
  name: z.string(),
  state: z.enum(ManufacturingState),
  date: z.date(),
  quantity: z.number().gt(0.0, "El número de fabricación debe ser mayor a 0.0"),
  yield: z.number(),
  productId: z.object({
    id: z.string().min(1, "Producto es requerido"),
    name: z.string(),
  }),
  uomId: z.object({
    id: z.string(),
    name: z.string(),
  }),
  whOriginId: z.object({
    id: z.string().min(1, "Almacén origen es requerido"),
    name: z.string(),
  }),
  whDestId: z.object({
    id: z.string().min(1, "Almacén destindo es requerido"),
    name: z.string(),
  }),
  ManufacturingLines: z.array(manufacturingLineSchema),
  createdUid: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type ManufacturingLineSchemaType = z.infer<typeof manufacturingLineSchema>;

export type ManufacturingSchemaType = z.infer<typeof manufacturingSchema>;

export const manufacturingSchemaDefault: ManufacturingSchemaType = {
  name: "",
  date: new Date(),
  state: "draft",
  quantity: 1.0,
  yield: 0.0,
  productId: { id: "", name: "" },
  uomId: { id: "", name: "" },
  whOriginId: { id: "", name: "" },
  whDestId: { id: "", name: "" },
  ManufacturingLines: [],
  createdUid: null,
  createdAt: null,
  updatedAt: null,
};
