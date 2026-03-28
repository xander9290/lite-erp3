import { FieldType } from "@/generated/prisma/enums";
import { z } from "zod";

export const modelSchema = z.object({
  name: z.string(),
  label: z.string().min(1, "Etiqueta es requerido"),
  description: z.string().min(1, "Descripción es requerido"),
  active: z.boolean(),
  lines: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().optional(),
      label: z.string().min(1, "Etiqueta es requerido"),
      description: z.string().min(1, "Descripción es requerido"),
      active: z.boolean(),
      fieldType: z.enum(FieldType),
    }),
  ),
});

export type ModelSchemaType = z.infer<typeof modelSchema>;

export const modelSchemaDefault: ModelSchemaType = {
  name: "",
  label: "",
  description: "",
  active: true,
  lines: [],
};
