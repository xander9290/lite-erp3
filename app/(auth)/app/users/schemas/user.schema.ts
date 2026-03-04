import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  login: z.string().min(1, "Usuario es requerido"),
  lastLogin: z.date().nullable(),
  active: z.boolean(),
  userId: z.string().min(1, "Usuario es requerido"),
  userIds: z.array(z.string()).min(1, "Debes relacionar usuarios"),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type userSchemaType = z.infer<typeof userSchema>;

export const userSchemaDefault: userSchemaType = {
  name: "",
  login: "",
  userId: "",
  userIds: [],
  active: true,
  lastLogin: null,
  createdAt: null,
  updatedAt: null,
};
