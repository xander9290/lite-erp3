import { ProductDisplayType, ProductStateType } from "@/generated/prisma/enums";
import { z } from "zod";

export const productTemplateSchema = z.object({
  name: z.string(),
  description: z.string().min(1, "Descripción es requerido"),
  defaultCode: z.string().min(1, "Referencia interna es requerido"),
  active: z.boolean(),
  sales: z.boolean(),
  purchases: z.boolean(),
  manufacturing: z.boolean(),
  yield: z.number(),
  displayType: z.enum(ProductDisplayType),
  state: z.enum(ProductStateType),
  imageUrl: z.string().nullable(),
  price1: z.number(),
  price2: z.number(),
  price3: z.number(),
  price4: z.number(),
  price5: z.number(),
  lastCost: z.number(),
  weight: z.number(),
  volume: z.number(),
  ancho: z.number(),
  alto: z.number(),
  largo: z.number(),
  uomIncomingAllowed: z.number(),
  uomOutgoingAllowed: z.number(),
  supplierId: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  userId: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  productCategoryId: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  productBrandId: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  uomId: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  ProductPackagingLines: z.array(
    z.object({
      id: z.string(),
      packagingId: z.object({ id: z.string().min(1, "Embalaje es requerido"), name: z.string() }),
      productId: z.object({ id: z.string(), name: z.string() }),
      qty: z.number().min(1, "Cantidad es requerida"),
      uomId: z.object({ id: z.string().min(1, "Unidad de medida en embalaje es requeridio"), name: z.string() }),
    }),
  ),
  ReceiptLines: z.array(
    z.object({
      id: z.string(),
      qty: z.number(),
      active: z.boolean(),
      productId: z.object({ id: z.string().min(1, "Producto es requerido"), name: z.string() }),
      uomId: z.object({ id: z.string(), name: z.string() }),
    }),
  ),
  Tags: z.array(z.string()),
  taxSaleId: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  taxPurchaseId: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  createdUid: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type ProductTemplateSchemaType = z.infer<typeof productTemplateSchema>;

export const productTemplateSchemaDefault: ProductTemplateSchemaType = {
  name: "",
  description: "",
  defaultCode: "",
  active: true,
  sales: true,
  purchases: true,
  manufacturing: false,
  yield: 0.0,
  displayType: "PRODUCT",
  state: "AVAILABLE",
  imageUrl: null,
  lastCost: 0.0,
  price1: 0.0,
  price2: 0.0,
  price3: 0.0,
  price4: 0.0,
  price5: 0.0,
  alto: 0,
  ancho: 0,
  largo: 0,
  weight: 0,
  volume: 0,
  supplierId: { id: "", name: "" },
  userId: { id: "", name: "" },
  uomIncomingAllowed: 0,
  uomOutgoingAllowed: 0,
  Tags: [],
  productCategoryId: {
    id: "",
    name: "",
  },
  productBrandId: {
    id: "",
    name: "",
  },
  ProductPackagingLines: [],
  ReceiptLines: [],
  uomId: { id: "", name: "" },
  taxSaleId: { id: "", name: "" },
  taxPurchaseId: { id: "", name: "" },
  createdAt: null,
  createdUid: null,
  updatedAt: null,
};
