import { PurchaseOrderState } from "@/generated/prisma/enums";
import { z } from "zod";

export const purchaseOrderSchema = z.object({
  name: z.string(),
  date: z.date(),
  dateOrder: z.date(),
  datePlanned: z.date().nullable(),
  state: z.enum(PurchaseOrderState),
  subtotal: z.number(),
  total: z.number(),
  supplierId: z.object({
    id: z.string().min(1, "Proveedor es requerido"),
    name: z.string(),
  }),
  userId: z.object({
    id: z.string(),
    name: z.string(),
  }),
  warehouseDestId: z.object({
    id: z.string().min(1, "Almacén destino es requerido"),
    name: z.string(),
  }),
  paymentTermId: z.object({
    id: z.string().min(1, "Términos de pago es requerido"),
    name: z.string(),
  }),
  OrderLines: z.array(
    z.object({
      id: z.string().nullable(),
      productId: z.object({ id: z.string().min(1, "Producto es requerido"), name: z.string() }),
      uomId: z.object({ id: z.string(), name: z.string() }),
      priceUnit: z.number(),
      quantity: z.number(),
      taxRate: z.number(),
      taxAmount: z.number(),
      subtotal: z.number(),
      total: z.number(),
    }),
  ),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type PurchaseOrderSchemaType = z.infer<typeof purchaseOrderSchema>;

const now = new Date();
const getDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

export const purchaseOrderSchemaDefault: PurchaseOrderSchemaType = {
  name: "",
  date: getDate,
  dateOrder: getDate,
  datePlanned: null,
  state: "draft",
  subtotal: 0.0,
  total: 0.0,
  paymentTermId: { id: "", name: "" },
  supplierId: {
    id: "",
    name: "",
  },
  userId: {
    id: "",
    name: "",
  },
  warehouseDestId: {
    id: "",
    name: "",
  },
  OrderLines: [],
  createdAt: null,
  updatedAt: null,
};
