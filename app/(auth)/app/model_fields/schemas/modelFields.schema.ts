import { FieldType } from "@/generated/prisma/enums";
import { z } from "zod";

export const modelFieldSchema = z.object({
  name: z.string(),
  label: z.string().min(1, "Etiqueta es requerido"),
  description: z.string().min(1, "Descripción es requerido"),
  fieldType: z.enum(FieldType),
  active: z.boolean(),
  modelId: z.object({
    id: z.string(),
    name: z.string(),
  }),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
  createdUid: z.string(),
});

export type ModelFieldSchemaType = z.infer<typeof modelFieldSchema>;

export const modelFieldSchemaDefault: ModelFieldSchemaType = {
  name: "",
  label: "",
  description: "",
  fieldType: "string",
  active: true,
  modelId: {
    id: "",
    name: "",
  },
  createdAt: null,
  updatedAt: null,
  createdUid: "",
};
