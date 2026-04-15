import { WarehouseType } from "@/generated/prisma/enums";
import { z } from "zod";

export const warehouseSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  code: z.string().min(1, "Código es requerido"),
  description: z.string().min(1, "Descripción es requerido"),
  type: z.enum(WarehouseType),
  active: z.boolean(),
  compnayId: z.object({
    id: z.string(),
    name: z.string(),
  }),
  userIds: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
  internalIds: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
  createdUid: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type WarehouseSchemaType = z.infer<typeof warehouseSchema>;

export const warehouseSchemaDefault: WarehouseSchemaType = {
  name: "",
  code: "",
  description: "",
  active: true,
  type: "SALES",
  compnayId: {
    id: "",
    name: "",
  },
  userIds: [],
  internalIds: [],
  createdUid: null,
  createdAt: null,
  updatedAt: null,
};
