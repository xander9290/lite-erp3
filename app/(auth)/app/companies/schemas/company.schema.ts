import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  code: z.string(),
  active: z.boolean(),
  userIds: z.array(z.string()),
  managerId: z.string().nullable(),
  partnerId: z.string(),
  parentId: z.string().nullable(),
  childrenIds: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      managerId: z.string(),
    }),
  ),
  imageUrl: z.string().nullable(),
  phone: z.string(),
  street: z.string(),
  houseNumber: z.string(),
  town: z.string(),
  zip: z.number(),
  county: z.string(),
  province: z.string(),
  country: z.string(),
  vat: z.string(),
  createdUid: z.string().nullable(),
  streets: z.string(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type CompanySchemaType = z.infer<typeof companySchema>;

export const companySchemaDefault: CompanySchemaType = {
  name: "",
  code: "",
  active: true,
  imageUrl: null,
  street: "",
  houseNumber: "",
  streets: "",
  zip: 0,
  town: "",
  county: "",
  province: "",
  country: "",
  phone: "",
  vat: "",
  userIds: [],
  managerId: null,
  partnerId: "",
  parentId: null,
  childrenIds: [],
  createdUid: null,
  createdAt: null,
  updatedAt: null,
};
