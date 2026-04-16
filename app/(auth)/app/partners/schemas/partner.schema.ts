import { PartnerDisplayType } from "@/generated/prisma/enums";
import { z } from "zod";

export const partnerSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  email: z.email(),
  imageUrl: z.string(),
  phone: z.string(),
  street: z.string(),
  houseNumber: z.string(),
  streets: z.string(),
  town: z.string(),
  zip: z.number(),
  county: z.string(),
  province: z.string(),
  country: z.string(),
  vat: z.string(),
  displayType: z.enum(PartnerDisplayType),
  active: z.boolean(),
  userId: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  createdUid: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type PartnerSchemaType = z.infer<typeof partnerSchema>;

export const partnerSchemaDefault: PartnerSchemaType = {
  name: "",
  email: "",
  imageUrl: "",
  phone: "",
  street: "",
  houseNumber: "",
  streets: "",
  town: "",
  zip: 0,
  county: "",
  country: "",
  province: "",
  vat: "",
  displayType: "INTERNAL",
  active: true,
  userId: { id: "", name: "" },
  createdUid: null,
  createdAt: null,
  updatedAt: null,
};
