import { PartnerDisplayType } from "@/generated/prisma/enums";
import { z } from "zod";

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
  Children: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      mobile: z.string().nullable(),
      displayType: z.enum(PartnerDisplayType),
      completeAddress: z.string().nullable(),
    }),
  ),
  parentId: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
    })
    .nullable(),
  createdUid: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type PartnerSchemaType = z.infer<typeof partnerSchema>;

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
  createdUid: null,
  createdAt: null,
  updatedAt: null,
};
