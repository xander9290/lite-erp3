import { WarehouseType } from "@/generated/prisma/enums";
import { z } from "zod";

export const warehouseSchema = z.object({
  name: z.string(),
  code: z.string().min(1, "Código es requerido"),
  description: z.string().min(1, "Descripción es requerido"),
  type: z.enum(WarehouseType),
  active: z.boolean(),
  companyId: z.object({
    id: z.string().min(1, "Empresa es requerido"),
    name: z.string(),
  }),
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
  companyId: {
    id: "",
    name: "",
  },
  internalIds: [],
  createdUid: null,
  createdAt: null,
  updatedAt: null,
};
