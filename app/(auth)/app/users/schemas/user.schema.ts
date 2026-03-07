import { email, z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  login: z.string().min(1, "Usuario es requerido"),
  email: z.string(),
  lastLogin: z.date().nullable(),
  active: z.boolean(),
  managerId: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type UserSchemaType = z.infer<typeof userSchema>;

export const userSchemaDefault: UserSchemaType = {
  name: "",
  login: "",
  email: "",
  active: true,
  managerId: null,
  lastLogin: null,
  createdAt: null,
  updatedAt: null,
};
