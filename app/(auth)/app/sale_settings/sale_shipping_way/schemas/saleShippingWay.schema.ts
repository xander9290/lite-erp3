import { SaleShippingWayType } from "@/generated/prisma/enums";
import { z } from "zod";

export const saleShippingWaySchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  type: z.enum(SaleShippingWayType),
  active: z.boolean(),
});

export type SaleShippingWaySchemaType = z.infer<typeof saleShippingWaySchema>;

export const saleShippingWaySchemaDefault: SaleShippingWaySchemaType = {
  name: "",
  type: "counter",
  active: true,
};
