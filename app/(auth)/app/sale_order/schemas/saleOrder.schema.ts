import { SaleOrderState } from "@/generated/prisma/browser";
import { z } from "zod";

export const saleOrderSchema = z.object({
  name: z.string(),
  orderDate: z.date(),
  confirmedDate: z.date().nullable(),
  obs: z.string().nullable(),
  purchaseRef: z.string().nullable(),
  reference: z.string().nullable(),
  state: z.enum(SaleOrderState),
  saleUserId: z.object({
    id: z.string().min(1, "Vendedor es requerido"),
    name: z.string(),
  }),
  partnerId: z.object({
    id: z.string().min(1, "Cliente es requerido"),
    name: z.string(),
  }),
  partnerShippingId: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
  }),
  warehouseId: z.object({
    id: z.string().min(1, "Almacén de salida es requerido"),
    name: z.string(),
  }),
  companyId: z.object({
    id: z.string(),
    name: z.string(),
  }),
  shippingWayId: z.object({
    id: z.string().min(1, "Forma de envío es requerido"),
    name: z.string(),
  }),
});

export type SaleOrderSchemaType = z.infer<typeof saleOrderSchema>;

export const saleOrderSchemaDefault: SaleOrderSchemaType = {
  name: "",
  orderDate: new Date(),
  confirmedDate: new Date(),
  obs: "",
  purchaseRef: "",
  reference: "",
  state: "draft",
  saleUserId: { id: "", name: "" },
  partnerId: { id: "", name: "" },
  partnerShippingId: { id: "", name: "" },
  warehouseId: { id: "", name: "" },
  shippingWayId: { id: "", name: "" },
  companyId: { id: "", name: "" },
};
