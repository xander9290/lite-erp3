import { email, z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  login: z.string().min(1, "Usuario es requerido"),
  email: z.string(),
  lastLogin: z.date().nullable(),
  active: z.boolean(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type userSchemaType = z.infer<typeof userSchema>;

export const userSchemaDefault: userSchemaType = {
  name: "",
  login: "",
  email: "",
  active: true,
  lastLogin: null,
  createdAt: null,
  updatedAt: null,
};
