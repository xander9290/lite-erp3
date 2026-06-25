import { z } from "zod";

export const icurrencySchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  description: z.string().min(1, "Descripción es requerido"),
  label: z.string().min(1, "Etiqueta es requerido"),
  symbol: z.string().min(1, "Símbolo es requerido"),
  active: z.boolean(),
});

export type ICurrencySchema = z.infer<typeof icurrencySchema>;

export const icurrencySchemaDefault: ICurrencySchema = {
  name: "",
  description: "",
  label: "",
  symbol: "",
  active: true,
};
