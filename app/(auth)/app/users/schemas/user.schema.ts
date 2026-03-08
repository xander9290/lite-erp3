import { email, z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  login: z.string().min(1, "Usuario es requerido"),
  email: z.string(),
  imageUrl: z.string().nullable(),
  lastLogin: z.date().nullable(),
  active: z.boolean(),
  groupId: z.string().nullable(),
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
  groupId: null,
  createdUid: null,
  createdAt: null,
  updatedAt: null,
};
