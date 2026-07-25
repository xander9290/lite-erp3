import { todayDate } from "@/app/libs/validatorDate";
import {
  ProductPricelistItem,
  SaleOrderState,
} from "@/generated/prisma/browser";
import { z } from "zod";

const saleOrderLineSchema = z.object({
  id: z.string().nullable(),
  orderId: z.object({
    id: z.string(),
    name: z.string(),
  }),
  productId: z.object({
    id: z.string(),
    name: z.string(),
  }),
  quantity: z.number(),
  uomId: z.object({
    id: z.string(),
    name: z.string(),
  }),
  pricelist: z.enum(ProductPricelistItem),
  priceUnit: z.number(),
  subtotal: z.number(),
  total: z.number(),
  taxRate: z.number(),
  taxAmount: z.number(),
});

export const saleOrderSchema = z.object({
  name: z.string(),
  orderDate: z.iso.date(),
  confirmedDate: z.string().nullable(),
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
    pricelist: z.enum(ProductPricelistItem).nullable(),
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
  paymentTermId: z.object({
    id: z.string(),
    name: z.string(),
  }),
  SaleOrderLines: z.array(saleOrderLineSchema),
});

export type SaleOrderSchemaType = z.infer<typeof saleOrderSchema>;
export type SaleOrderLineSchemaType = z.infer<typeof saleOrderLineSchema>;

export const saleOrderSchemaDefault: SaleOrderSchemaType = {
  name: "new",
  orderDate: todayDate(),
  confirmedDate: null,
  obs: "",
  purchaseRef: "",
  reference: "",
  state: "draft",
  saleUserId: { id: "", name: "" },
  partnerId: { id: "", name: "", pricelist: "price1" },
  partnerShippingId: { id: "", name: "" },
  warehouseId: { id: "", name: "" },
  shippingWayId: { id: "", name: "" },
  companyId: { id: "", name: "" },
  paymentTermId: { id: "", name: "" },
  SaleOrderLines: [],
};

export const saleOrderLineSchemaDefault: SaleOrderLineSchemaType = {
  id: null,
  orderId: { id: "", name: "" },
  priceUnit: 0.0,
  pricelist: "price1",
  productId: { id: "", name: "" },
  quantity: 1.0,
  subtotal: 0.0,
  taxAmount: 0.0,
  taxRate: 0.0,
  total: 0.0,
  uomId: { id: "", name: "" },
};
