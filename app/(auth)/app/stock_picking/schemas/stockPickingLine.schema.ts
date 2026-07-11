import { z } from "zod";

export const stockPickingLine = z.object({
  id: z.string().optional(),
  quantity: z.number().min(0.1, "Cantidad solicitida debe ser mayor a 0.0"),
  delivered: z.number(),
  productId: z.object({
    id: z.string().min(1, "Producto es requerido"),
    name: z.string(),
  }),
  uomId: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

export type StockPickingLineType = z.infer<typeof stockPickingLine>;

export const stockPickingLineDefautl: StockPickingLineType = {
  delivered: 0.0,
  productId: { id: "", name: "" },
  quantity: 0.0,
  uomId: { id: "", name: "" },
  id: undefined,
};
