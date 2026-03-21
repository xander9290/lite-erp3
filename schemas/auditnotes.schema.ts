import { z } from "zod";

export const auditNotesSchema = z.object({
  string: z.string().min(1, "El campo nota es requerido"),
});

export type AuditNotesSchemaType = z.infer<typeof auditNotesSchema>;

export const auditNotesSchemaDefault: AuditNotesSchemaType = {
  string: "",
};
