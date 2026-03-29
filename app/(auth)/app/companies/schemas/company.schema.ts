import { string, z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  code: z.string(),
  active: z.boolean(),
  userIds: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
  managerId: z
    .object({
      id: string(),
      name: string(),
    })
    .nullable(),
  partnerId: z.string(),
  parentId: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  childrenIds: z.array(
    z.object({
      companyId: z.object({
        id: z.string(),
        name: z.string(),
      }),
      managerId: z.object({
        id: z.string(),
        name: z.string(),
      }),
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
  managerId: {
    id: "",
    name: "",
  },
  partnerId: "",
  parentId: {
    id: "",
    name: "",
  },
  childrenIds: [],
  createdUid: null,
  createdAt: null,
  updatedAt: null,
};
