import { todayDate } from "@/app/libs/validatorDate";
import { PickingOperationType, StockPickingState } from "@/generated/prisma/enums";
import { z } from "zod";

export const stockPickingSchema = z.object({
  name: z.string(),
  date: z.iso.date(),
  datePlanned: z.iso.date(),
  confirmedDate: z.string().nullable(),
  readyDate: z.string().nullable(),
  doneDate: z.string().nullable(),
  reference: z.string().nullable(),
  state: z.enum(StockPickingState),
  operationType: z.enum(PickingOperationType),
  whId: z.object({
    id: z.string().min(1, "Almacén origen es requerido"),
    name: z.string(),
  }),
  whDestId: z.object({
    id: z.string().min(1, "Almacén destino es requerido"),
    name: z.string(),
  }),
  partnerId: z.object({
    id: z.string().min(1, "Contacto es requerido"),
    name: z.string(),
  }),
  operatorId: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
    })
    .nullable(),
  saleId: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
    })
    .nullable(),
  purchaseId: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
    })
    .nullable(),
});

export type StockPickingSchemaType = z.infer<typeof stockPickingSchema>;

export const stockPickingSchemaDefault: StockPickingSchemaType = {
  name: "",
  confirmedDate: null,
  date: todayDate(),
  datePlanned: todayDate(),
  doneDate: null,
  operatorId: { id: "", name: "" },
  operationType: "internal",
  partnerId: { id: "", name: "" },
  purchaseId: { id: "", name: "" },
  readyDate: null,
  reference: "",
  saleId: { id: "", name: "" },
  state: "draft",
  whDestId: { id: "", name: "" },
  whId: { id: "", name: "" },
};
