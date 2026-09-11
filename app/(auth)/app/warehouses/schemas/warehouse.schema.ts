import { WarehouseType } from "@/generated/prisma/enums";
import { z } from "zod";

export const warehouseSchema = z.object({
  name: z.string(),
  code: z.string().min(1, "Código es requerido"),
  description: z.string().min(1, "Descripción es requerido"),
  type: z.enum(WarehouseType),
  reserveQtyWs: z.boolean(),
  saleQtyWs: z.boolean(),
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
  journalId: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
    })
    .nullable(),
  createdUid: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type WarehouseSchemaType = z.infer<typeof warehouseSchema>;

export const warehouseSchemaDefault: WarehouseSchemaType = {
  name: "",
  code: "",
  description: "",
  reserveQtyWs: false,
  saleQtyWs: false,
  active: true,
  type: "SALES",
  companyId: {
    id: "",
    name: "",
  },
  journalId: { id: "", name: "" },
  internalIds: [],
  createdUid: null,
  createdAt: null,
  updatedAt: null,
};
