import { z } from "zod";

export const groupSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  active: z.boolean(),
  users: z.array(z.string()),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type GroupSchemaType = z.infer<typeof groupSchema>;

export const groupSchemaDefault: GroupSchemaType = {
  name: "",
  active: true,
  users: [],
  createdAt: null,
  updatedAt: null,
};
