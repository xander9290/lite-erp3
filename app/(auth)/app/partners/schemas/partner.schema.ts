import { PartnerDisplayType, ProductPricelistItem } from "@/generated/prisma/enums";
import { z } from "zod";

export const partnerChildrenSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  mobile: z.string().min(1, "Teléfono móvil es requerido"),
  phone: z.string().nullable(),
  street: z.string().min(1, "Calle es requerido"),
  houseNumber: z.string().min(1, "Número exterior es requerido"),
  town: z.string().nullable(),
  obs: z.string().nullable(),
  displayType: z.enum(PartnerDisplayType),
  completeAddress: z.string().nullable(),
});

export const partnerSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  email: z.email().nullable(),
  imageUrl: z.string().nullable(),
  phone: z.string().nullable(),
  mobile: z.string().nullable(),
  street: z.string().nullable(),
  houseNumber: z.string().nullable(),
  streets: z.string().nullable(),
  town: z.string().nullable(),
  zip: z.string().nullable(),
  county: z.string().nullable(),
  province: z.string().nullable(),
  country: z.string().nullable(),
  vat: z.string().nullable(),
  displayType: z.enum(PartnerDisplayType),
  active: z.boolean(),
  userId: z
    .object({
      id: z.string().nullable(),
      name: z.string().nullable(),
    })
    .nullable(),
  Tags: z.array(z.string()),
  Children: z.array(partnerChildrenSchema),
  parentId: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
    })
    .nullable(),
  paymentTermId: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
    })
    .nullable(),
  productPricelist: z.enum(ProductPricelistItem).nullable(),
  createdUid: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type PartnerSchemaType = z.infer<typeof partnerSchema>;
export type PartnerChildrenType = z.infer<typeof partnerChildrenSchema>;

export const partnerSchemaDefault: PartnerSchemaType = {
  name: "",
  email: null,
  imageUrl: null,
  phone: null,
  mobile: null,
  street: null,
  houseNumber: null,
  streets: null,
  town: null,
  zip: null,
  county: null,
  country: null,
  province: null,
  vat: null,
  displayType: "INTERNAL",
  active: true,
  userId: { id: null, name: null },
  parentId: { id: "", name: "" },
  Tags: [],
  Children: [],
  paymentTermId: { id: "", name: "" },
  productPricelist: null,
  createdUid: null,
  createdAt: null,
  updatedAt: null,
};

export const partnerChildrenSchemaDefault: PartnerChildrenType = {
  name: "",
  street: "",
  phone: null,
  mobile: "",
  houseNumber: "",
  town: null,
  displayType: "CONTACT",
  completeAddress: null,
  obs: "",
};
