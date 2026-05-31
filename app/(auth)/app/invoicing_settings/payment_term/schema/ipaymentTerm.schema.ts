import { z } from "zod";

export const ipaymentTermSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  amount: z.number(),
  days: z.number(),
  active: z.boolean(),
});

export type IPaymentTermSchemaType = z.infer<typeof ipaymentTermSchema>;

export const ipaymentTermSchemaDefault: IPaymentTermSchemaType = {
  name: "",
  amount: 100,
  days: 0,
  active: true,
};
