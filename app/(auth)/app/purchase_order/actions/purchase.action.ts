"use server";

import type { PurchaseOrder } from "@/generated/prisma/client";
import { PurchaseOrderSchemaType } from "../schemas/purchase.schema";
import prisma from "@/app/libs/prisma";
import { ActionResponse } from "@/app/libs/definitions";
import { sessionStore } from "@/app/libs/sessionStore";
import { getNextValue } from "@/app/libs/sequence";
import { createAuditlog } from "../../actions/auditlog-actions";
import { round } from "@/app/libs/helpers";

export interface PurchaseOrderWithProps extends PurchaseOrder {
  Supplier: { id: string; name: string };
  User: { id: string; name: string };
  WarehouseDest: { id: string; name: string; Company: { id: string; name: string } };
  PaymentTerm: { id: string; name: string } | null;
  OrderLines: {
    id: string;
    Product: { id: string; name: string };
    Uom: { id: string; name: string };
    priceUnit: number;
    quantity: number;
    subtotal: number;
    total: number;
  }[];
}

export type PurchaseOrderActionProps = Omit<PurchaseOrderSchemaType, "createdAt" | "updatedAt">;

export async function getPurchaseById({ id }: { id: string | null }): Promise<PurchaseOrderWithProps | null> {
  try {
    if (!id) throw new Error("ID not defined");
    const purchase = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        Supplier: {
          select: { id: true, name: true },
        },
        User: {
          select: { id: true, name: true },
        },
        WarehouseDest: {
          select: { id: true, name: true, Company: { select: { id: true, name: true } } },
        },
        PaymentTerm: {
          select: { id: true, name: true },
        },
        OrderLines: {
          select: {
            id: true,
            Product: { select: { id: true, name: true } },
            Uom: { select: { id: true, name: true } },
            priceUnit: true,
            total: true,
            subtotal: true,
            quantity: true,
          },
        },
      },
    });
    return purchase;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createPurchaseOrder({ data }: { data: PurchaseOrderActionProps }): Promise<ActionResponse<PurchaseOrderWithProps>> {
  try {
    const { uid, company } = await sessionStore();

    const name = await getNextValue(`P/${company.code}/`, `${company.code}-purchase`);
    const newPurchase = await prisma.purchaseOrder.create({
      data: {
        name,
        dateOrder: data.dateOrder,
        date: data.date,
        datePlanned: data.datePlanned,
        state: data.state,
        supplierId: data.supplierId.id,
        warehouseDestId: data.warehouseDestId.id,
        paymentTermId: data.paymentTermId.id,
        subtotal: round(
          data.OrderLines.reduce((acc, line) => acc + line.subtotal, 0),
          2,
        ),
        total: round(
          data.OrderLines.reduce((acc, line) => acc + line.total, 0),
          2,
        ),
        OrderLines: {
          createMany: {
            data: data.OrderLines.map((line) => ({
              productId: line.productId.id,
              uomId: line.uomId.id,
              priceUnit: line.priceUnit,
              quantity: line.quantity,
              subtotal: line.subtotal,
              total: line.total,
              createUid: uid || "",
            })),
          },
        },
        userId: uid!,
      },
      include: {
        Supplier: {
          select: { id: true, name: true },
        },
        User: {
          select: { id: true, name: true },
        },
        WarehouseDest: {
          select: { id: true, name: true, Company: { select: { id: true, name: true } } },
        },
        PaymentTerm: {
          select: { id: true, name: true },
        },
        OrderLines: {
          select: {
            id: true,
            Product: { select: { id: true, name: true } },
            Uom: { select: { id: true, name: true } },
            priceUnit: true,
            total: true,
            subtotal: true,
            quantity: true,
          },
        },
      },
    });

    await createAuditlog({
      action: "create",
      entityId: newPurchase.id,
      entityType: "purchaseOrder",
      log: "Ha creado el registro",
    });

    return {
      success: true,
      message: "Se ha creado el registro",
      data: newPurchase,
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

export async function updatePurchaseOrder({ id, data }: { id: string | null; data: PurchaseOrderActionProps }): Promise<ActionResponse<PurchaseOrderWithProps>> {
  try {
    if (!id) throw new Error("ID not define");

    const { uid } = await sessionStore();

    const newPurchase = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        dateOrder: data.dateOrder,
        datePlanned: data.datePlanned,
        state: data.state,
        supplierId: data.supplierId.id,
        warehouseDestId: data.warehouseDestId.id,
        paymentTermId: data.paymentTermId.id,
        subtotal: round(
          data.OrderLines.reduce((acc, line) => acc + line.subtotal, 0),
          2,
        ),
        total: round(
          data.OrderLines.reduce((acc, line) => acc + line.total, 0),
          2,
        ),
        OrderLines: {
          deleteMany: {
            id: {
              notIn: data.OrderLines.filter((l) => l.id).map((l) => l.id!),
            },
          },
          upsert: data.OrderLines.map((line) => ({
            where: { id: line.id ?? "" },
            update: {
              productId: line.productId.id,
              quantity: line.quantity,
              uomId: line.uomId.id,
              priceUnit: line.priceUnit,
              subtotal: round(line.subtotal, 2),
              total: round(line.total, 2),
            },
            create: {
              productId: line.productId.id,
              quantity: line.quantity,
              uomId: line.uomId.id,
              priceUnit: line.priceUnit,
              subtotal: round(line.subtotal, 2),
              total: round(line.total, 2),
              createUid: uid || "",
            },
          })),
        },
      },
      include: {
        Supplier: {
          select: { id: true, name: true },
        },
        User: {
          select: { id: true, name: true },
        },
        WarehouseDest: {
          select: { id: true, name: true, Company: { select: { id: true, name: true } } },
        },
        PaymentTerm: {
          select: { id: true, name: true },
        },
        OrderLines: {
          select: {
            id: true,
            Product: { select: { id: true, name: true } },
            Uom: { select: { id: true, name: true } },
            priceUnit: true,
            total: true,
            subtotal: true,
            quantity: true,
          },
        },
      },
    });

    await createAuditlog({
      action: "update",
      entityId: newPurchase.id,
      entityType: "purchaseOrder",
      log: "Ha editado el registro",
    });

    return {
      success: true,
      message: "Se ha editado el registro",
      data: newPurchase,
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}
