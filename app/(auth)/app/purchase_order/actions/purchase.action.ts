"use server";

import type { PurchaseOrder } from "@/generated/prisma/client";
import { PurchaseOrderSchemaType } from "../schemas/purchase.schema";
import prisma from "@/app/libs/prisma";
import { ActionResponse } from "@/app/libs/definitions";
import { sessionStore } from "@/app/libs/sessionStore";
import { getNextValue } from "@/app/libs/sequence";
import { createAuditlog } from "../../actions/auditlog-actions";
import { esMultiplo, round } from "@/app/libs/helpers";
import { getProductById } from "../../product_template/products/actions/productTemplate.action";

export interface PurchaseOrderWithProps extends PurchaseOrder {
  Supplier: { id: string; name: string };
  User: { id: string; name: string };
  WarehouseDest: {
    id: string;
    name: string;
    Company: { id: string; name: string };
  };
  WarehouseAffected: {
    id: string;
    name: string;
    Company: { id: string; name: string };
  } | null;
  PaymentTerm: { id: string; name: string } | null;
  OrderLines: {
    id: string;
    Product: { id: string; name: string };
    Uom: { id: string; name: string };
    priceUnit: number;
    taxRate: number;
    taxAmount: number;
    quantity: number;
    subtotal: number;
    total: number;
    receivedQty: number;
    ready: boolean;
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
          select: {
            id: true,
            name: true,
            Company: { select: { id: true, name: true } },
          },
        },
        WarehouseAffected: {
          select: {
            id: true,
            name: true,
            Company: { select: { id: true, name: true } },
          },
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
            taxRate: true,
            taxAmount: true,
            subtotal: true,
            quantity: true,
            receivedQty: true,
            ready: true,
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

    await validateMultiplo(data.OrderLines);

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
        confirmedDate: data.confirmedDate,
        subtotal: round(
          data.OrderLines.reduce((acc, line) => acc + line.subtotal, 0),
          2,
        ),
        total: round(
          data.OrderLines.reduce((acc, line) => acc + line.total, 0),
          2,
        ),
        amountTax: round(
          data.OrderLines.reduce((acc, line) => acc + line.taxAmount, 0),
          2,
        ),
        OrderLines: {
          createMany: {
            data: data.OrderLines.map((line) => ({
              productId: line.productId.id,
              uomId: line.uomId.id,
              priceUnit: line.priceUnit,
              quantity: line.quantity,
              receivedQty: line.quantity,
              taxRate: round(line.taxRate, 2),
              taxAmount: round(line.taxAmount, 2),
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
          select: {
            id: true,
            name: true,
            Company: { select: { id: true, name: true } },
          },
        },
        WarehouseAffected: {
          select: {
            id: true,
            name: true,
            Company: { select: { id: true, name: true } },
          },
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
            taxRate: true,
            taxAmount: true,
            subtotal: true,
            quantity: true,
            receivedQty: true,
            ready: true,
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

    await validateMultiplo(data.OrderLines);

    const newPurchase = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        dateOrder: data.dateOrder,
        datePlanned: data.datePlanned,
        state: data.state,
        supplierId: data.supplierId.id,
        warehouseDestId: data.warehouseDestId.id,
        warehouseAffectedId: data.warehouseAffectedId?.id ? data.warehouseAffectedId.id : null,
        paymentTermId: data.paymentTermId.id,
        confirmedDate: data.confirmedDate,
        subtotal: round(
          data.OrderLines.reduce((acc, line) => acc + line.subtotal, 0),
          2,
        ),
        total: round(
          data.OrderLines.reduce((acc, line) => acc + line.total, 0),
          2,
        ),
        amountTax: round(
          data.OrderLines.reduce((sum, line) => sum + line.taxAmount, 0),
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
              taxRate: round(line.taxRate, 2),
              taxAmount: round(line.taxAmount, 2),
              subtotal: round(line.subtotal, 2),
              receivedQty: line.receivedQty,
              total: round(line.total, 2),
              ready: line.ready,
            },
            create: {
              productId: line.productId.id,
              quantity: line.quantity,
              uomId: line.uomId.id,
              priceUnit: line.priceUnit,
              taxRate: round(line.taxRate, 2),
              taxAmount: round(line.taxAmount, 2),
              subtotal: round(line.subtotal, 2),
              total: round(line.total, 2),
              receivedQty: line.quantity,
              ready: line.ready,
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
          select: {
            id: true,
            name: true,
            Company: { select: { id: true, name: true } },
          },
        },
        WarehouseAffected: {
          select: {
            id: true,
            name: true,
            Company: { select: { id: true, name: true } },
          },
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
            taxRate: true,
            taxAmount: true,
            subtotal: true,
            quantity: true,
            receivedQty: true,
            ready: true,
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

export async function confirmStockWarehousePurchase({ data }: { data: PurchaseOrderActionProps }): Promise<ActionResponse<true>> {
  try {
    const { uid } = await sessionStore();

    for (const line of data.OrderLines) {
      await prisma.stockWarehouse.upsert({
        where: {
          productId_warehouseId: {
            productId: line.productId.id,
            warehouseId: data.warehouseDestId.id,
          },
        },
        update: {
          qty: {
            increment: line.quantity,
          },
        },
        create: {
          productId: line.productId.id,
          warehouseId: data.warehouseDestId.id,
          qty: line.quantity,
          createdUid: uid || "",
        },
      });
    }

    return {
      success: true,
      message: "Se ha creado el regristro",
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function cancelStockWarehousePurchase({ orderId, data }: { orderId: string | null; data: PurchaseOrderActionProps }): Promise<ActionResponse<true>> {
  try {
    if (!orderId) throw new Error("ID not defined");

    await prisma.$transaction(async (tx) => {
      for (const line of data.OrderLines) {
        await tx.stockWarehouse.update({
          where: {
            productId_warehouseId: {
              productId: line.productId.id,
              warehouseId: data.warehouseDestId.id,
            },
          },
          data: {
            qty: {
              decrement: line.quantity,
            },
          },
        });
      }
      await tx.purchaseOrderLine.updateMany({
        where: {
          orderId,
        },
        data: {
          state: "cancel",
        },
      });
    });

    return {
      success: true,
      message: "Se ha completado la acción",
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

const validateMultiplo = async (lines: PurchaseOrderActionProps["OrderLines"]) => {
  for (const line of lines) {
    if (line.receivedQty > line.quantity) throw new Error(`La cantidad recbida del product ${line.productId.name} no debe ser mayor a la ordenada.`);
    const productId = await getProductById({ id: line.productId.id });
    if (productId) {
      const allowedQty = productId.uomIncomingAllowed;
      const qty = line.quantity;
      if (!esMultiplo(qty, allowedQty)) {
        throw new Error(`El producto ${productId.name} se compra por múltiplo de ${allowedQty} ${productId.Uom?.code}`);
      }
    }
  }
};
