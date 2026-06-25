"use server";

import type { PurchaseLineStates, PurchaseOrder } from "@/generated/prisma/client";
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
    pendingQty: number;
    ready: boolean;
    state: PurchaseLineStates;
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
            pendingQty: true,
            ready: true,
            state: true,
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
              pendingQty: line.quantity,
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
            pendingQty: true,
            ready: true,
            state: true,
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
              pendingQty: round(line.quantity, 3) - round(line.receivedQty, 3),
              total: round(line.total, 2),
              state: data.state === "cancel" ? "cancel" : line.state,
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
              pendingQty: round(line.quantity, 3) - round(line.receivedQty, 3),
              ready: line.ready,
              state: data.state === "cancel" ? "cancel" : line.state,
              createUid: uid!,
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
            pendingQty: true,
            ready: true,
            state: true,
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

    await validateMultiplo(data.OrderLines);

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

export async function cancelStockWarehousePurchase({ orderId, data }: { orderId: string | null; data: PurchaseOrderActionProps }): Promise<ActionResponse<boolean>> {
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

export async function createAffectStock({ data }: { data: PurchaseOrderActionProps }): Promise<ActionResponse<boolean>> {
  try {
    if (data.warehouseAffectedId?.id === undefined) throw new Error("Almacén Destino para afectar existencias no definido");
    const { uid, company } = await sessionStore();

    await prisma.$transaction(async (tx) => {
      const getReadyLines = await tx.purchaseOrderLine.findMany({
        where: {
          ready: true,
          state: "pending",
        },
        include: {
          Product: {
            select: { name: true, standarPrice: true, id: true },
          },
        },
      });

      for (const line of getReadyLines) {
        // ============================================
        // 1. OBTENER TODO EL INVENTARIO ACTUAL
        // ============================================
        const currentStock = await tx.stockWarehouse.findMany({
          where: {
            AND: [
              { productId: line.Product.id },
              {
                Warehouse: {
                  type: { in: ["PRODUCTION", "SALES", "QUARANTINE"] },
                },
              },
            ],
          },
        });

        // ============================================
        // 2. CALCULAR NUEVO COSTO PROMEDIO UNA SOLA VEZ
        // ============================================
        // Sumar cantidades de TODOS los almacenes
        const totalCurrentQty = currentStock.reduce((sum, curr) => sum + (curr.qty || 0), 0);

        // Obtener el precio promedio actual del producto
        const currentProductTemplate = await tx.productTemplate.findUnique({
          where: { id: line.Product.id },
          select: { standarPrice: true },
        });

        const currentStandarPrice = currentProductTemplate?.standarPrice || 0;
        const newPurchasePrice = line.priceUnit;
        const newQty = line.receivedQty;

        let newStandardPrice = newPurchasePrice;

        if (totalCurrentQty + newQty > 0) {
          const totalCurrentValue = totalCurrentQty * currentStandarPrice;
          const totalValue = totalCurrentValue + newQty * newPurchasePrice;
          const totalQty = totalCurrentQty + newQty;
          newStandardPrice = round(totalValue / totalQty, 2);
        }

        console.log(
          `-Costos: Inventario total: ${totalCurrentQty} unidades, ` +
            `Precio promedio actual: $${currentStandarPrice}, ` +
            `Nuevo precio compra: $${newPurchasePrice}, ` +
            `Nuevo promedio: $${newStandardPrice}`,
        );

        // ============================================
        // 3. ACTUALIZAR COSTO PROMEDIO UNA SOLA VEZ
        // ============================================
        await tx.productTemplate.update({
          where: { id: line.Product.id },
          data: {
            lastCost: newPurchasePrice, // Último costo de compra
            standarPrice: newStandardPrice, // Costo promedio ponderado
          },
        });

        // ============================================
        // 4. ENTRADA AL ALMACÉN DE VENTAS O PRODUCCIÓN
        // ============================================
        console.log("-Afectando almacén");
        await tx.stockWarehouse.upsert({
          where: {
            productId_warehouseId: {
              productId: line.productId,
              warehouseId: data.warehouseAffectedId?.id || "",
            },
          },
          update: {
            qty: {
              increment: line.receivedQty,
            },
          },
          create: {
            productId: line.productId,
            warehouseId: data.warehouseAffectedId?.id || "",
            qty: line.receivedQty,
            createdUid: uid!,
          },
        });

        // ============================================
        // 5. CAMBIO DE ESTADO DE LA LÍNEA
        // ============================================
        await tx.purchaseOrderLine.update({
          where: { id: line.id },
          data: { state: "done" },
        });

        // ============================================
        // 6. MOVIMIENTO DE ALMACÉN (ENTRADA)
        // ============================================
        console.log(`-Creando líneas de movimiento de almacén: ${data.warehouseAffectedId?.name} - ${line.Product.name} - ${line.receivedQty}`);
        await tx.stockMove.create({
          data: {
            moveType: "incoming",
            name: "COMPRA",
            reference: data.name,
            companyId: company.id,
            productId: line.productId,
            quantity: line.receivedQty,
            userId: uid!,
            warehouseId: data.warehouseDestId.id,
            warehouseDestId: data.warehouseAffectedId?.id || "",
          },
        });

        // ============================================
        // 7. REMOVER EXISTENCIAS EN ALMACÉN COMPRAS
        // ============================================
        console.log("-Limpiando almacén compras");
        await tx.stockWarehouse.update({
          where: {
            productId_warehouseId: {
              productId: line.productId,
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

      // ============================================
      // 8. ACTUALIZAR ESTADO DE LA ORDEN DE COMPRA
      // ============================================
      const orderLines = await tx.purchaseOrderLine.findMany({
        where: {
          PurcaseOrder: {
            name: data.name,
          },
        },
      });

      const isCompleted = orderLines.every((line) => line.state === "done" && line.ready === true);

      if (isCompleted) {
        await tx.purchaseOrder.update({
          where: { name: data.name },
          data: { state: "done", doneDate: new Date() },
        });
      } else {
        await tx.purchaseOrder.update({
          where: { name: data.name },
          data: { state: "pending" },
        });
      }
    });

    return {
      success: true,
      message: "Se ha completado la acción",
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

// AQUI TAMBIÉN SE COLOCAN CONSTRAINS
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
