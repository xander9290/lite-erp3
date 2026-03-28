import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  login: z.string().min(1, "Usuario es requerido"),
  email: z.string(),
  imageUrl: z.string().nullable(),
  lastLogin: z.date().nullable(),
  active: z.boolean(),
  groupId: z.object({
    id: z.string().nullable(),
    name: z.string(),
  }),
  companies: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
  createdUid: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type UserSchemaType = z.infer<typeof userSchema>;

export const userSchemaDefault: UserSchemaType = {
  name: "",
  login: "",
  email: "",
  imageUrl: null,
  active: true,
  lastLogin: null,
  groupId: {
    id: "",
    name: "",
  },
  companies: [],
  createdUid: null,
  createdAt: null,
  updatedAt: null,
};
