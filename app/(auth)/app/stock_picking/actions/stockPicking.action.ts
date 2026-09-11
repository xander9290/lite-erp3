"use server";

import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import { sessionStore } from "@/app/libs/sessionStore";
import { PickingOperationType, StockPicking } from "@/generated/prisma/client";
import { StockPickingSchemaType } from "../schemas/stockPicking.schema";
import { getNextValue } from "@/app/libs/sequence";
import { getWarehouseById } from "../../warehouses/actions/warehouse-actions";
import { createAuditlog } from "../../actions/auditlog-actions";
import { todayDate } from "@/app/libs/validatorDate";
import { affectStockWarehouse, stockWarehouseReserve, stockWarehouseReserveCancel } from "../../stock_warehouse/actions/stockWarehouse.action";
import { round } from "@/app/libs/helpers";

export interface StockPickingWithProps extends StockPicking {
  Warehouse: {
    id: string;
    description: string;
    Company: { id: string; name: string };
  };
  WarehouseDest: {
    id: string;
    description: string;
    Company: { id: string; name: string };
  };
  Partner: { id: string; name: string };
  Operator: { id: string; name: string } | null;
  Company: { id: string; name: string };
  SaleOrder: { id: string; name: string } | null;
  PurchaseOrder: { id: string; name: string } | null;
  PickingLine: {
    id: string;
    Product: { id: string; name: string };
    Uom: { id: string; name: string; code: string };
    quantity: number;
    delivered: number;
  }[];
}

const generateOperationCode = (opeartion: PickingOperationType) => {
  let operationCode = "INT";
  switch (opeartion) {
    case "incoming":
      operationCode = "IN";
      break;
    case "outgoing":
      operationCode = "OUT";
      break;
    default:
      operationCode = "INT";
      break;
  }

  return operationCode;
};

export async function getStockPickingById({ id }: { id: string | null }): Promise<StockPickingWithProps | null> {
  try {
    if (!id) return null;

    const stock = await prisma.stockPicking.findUnique({
      where: {
        id,
      },
      include: {
        Warehouse: {
          select: {
            id: true,
            description: true,
            Company: { select: { id: true, name: true } },
          },
        },
        WarehouseDest: {
          select: {
            id: true,
            description: true,
            Company: { select: { id: true, name: true } },
          },
        },
        Partner: { select: { id: true, name: true } },
        Operator: { select: { id: true, name: true } },
        Company: { select: { id: true, name: true } },
        SaleOrder: { select: { id: true, name: true } },
        PurchaseOrder: { select: { id: true, name: true } },
        PickingLine: {
          select: {
            id: true,
            quantity: true,
            delivered: true,
            Product: { select: { id: true, name: true } },
            Uom: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    return stock;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function actionStockPicking({ data }: { data: StockPickingSchemaType }): Promise<ActionResponse<StockPickingWithProps>> {
  try {
    const { uid, company } = await sessionStore();

    const whDest = await getWarehouseById({ id: data.whDestId.id });
    const whOrigin = await getWarehouseById({ id: data.whId.id });

    if (!whDest || !whOrigin) {
      throw new Error("Almacenes no encontrados");
    }

    let name = "";
    if (data.name === "new") {
      name = await getNextValue(`${whDest.code}/${generateOperationCode(data.operationType)}/`, `${whDest.Company.code}-stockpicking`);
    }

    const picking = await prisma.stockPicking.upsert({
      where: {
        name: data.name,
      },
      update: {
        confirmedDate: data.confirmedDate ? new Date(data.confirmedDate) : null,
        doneDate: data.doneDate ? new Date(data.doneDate) : null,
        readyDate: data.readyDate ? new Date(data.readyDate) : null,
        datePlanned: new Date(data.datePlanned),
        cancelDate: data.cancelDate ? new Date(data.cancelDate) : null,
        opeartorId: data.operatorId?.id ? data.operatorId.id : null,
        partnerId: data.partnerId.id,
        state: data.state,
        reference: data.reference,
        whId: data.whId.id,
        whDestId: data.whDestId.id,
        companyOriginId: whOrigin.Company.id,
        companyDestId: whDest.Company.id,
        PickingLine: {
          deleteMany: {
            id: {
              notIn: data.PickingLine.filter((line) => line.id).map((l) => l.id!),
            },
          },
          update: data.PickingLine.filter((line) => line.id).map((line) => ({
            where: {
              id: line.id!,
            },
            data: {
              productId: line.productId.id,
              quantity: line.quantity,
              delivered: line.delivered,
              uomId: line.uomId.id,
            },
          })),
          createMany: {
            data: data.PickingLine.filter((line) => line.id === undefined).map((line) => ({
              productId: line.productId.id,
              quantity: line.quantity,
              delivered: 0.0,
              uomId: line.uomId.id,
              createUid: uid!,
            })),
          },
        },
      },
      create: {
        name,
        createUid: uid!,
        datePlanned: new Date(data.datePlanned),
        confirmedDate: data.confirmedDate ? new Date(data.confirmedDate) : null,
        date: new Date(data.date),
        partnerId: data.partnerId.id,
        whDestId: data.whDestId.id,
        whId: data.whId.id,
        operationType: data.operationType,
        purchaseId: data.purchaseId?.id ? data.purchaseId.id : null,
        reference: data.reference,
        saleId: data.saleId?.id ? data.saleId.id : null,
        state: data.state,
        companyId: company.id, // empresa creadora
        companyOriginId: whOrigin.Company.id, // empresa peticionada
        companyDestId: whDest.Company.id, // empresa pedidora
        PickingLine: {
          createMany: {
            data: data.PickingLine.map((line) => ({
              createUid: uid!,
              delivered: line.quantity,
              productId: line.productId.id,
              quantity: line.quantity,
              uomId: line.uomId.id,
            })),
          },
        },
      },
      include: {
        Warehouse: {
          select: {
            id: true,
            description: true,
            Company: { select: { id: true, name: true } },
          },
        },
        WarehouseDest: {
          select: {
            id: true,
            description: true,
            Company: { select: { id: true, name: true } },
          },
        },
        Partner: { select: { id: true, name: true } },
        Operator: { select: { id: true, name: true } },
        Company: { select: { id: true, name: true } },
        SaleOrder: { select: { id: true, name: true } },
        PurchaseOrder: { select: { id: true, name: true } },
        PickingLine: {
          select: {
            id: true,
            quantity: true,
            delivered: true,
            Product: { select: { id: true, name: true } },
            Uom: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    if (data.name !== "new") {
      await createAuditlog({
        action: "update",
        entityId: picking.id,
        entityType: "stockPicking",
        log: "Ha editado el registro",
      });
    } else {
      await createAuditlog({
        action: "create",
        entityId: picking.id,
        entityType: "stockPicking",
        log: "Ha creado el registro",
      });
    }

    return {
      success: true,
      message: "Operación completada",
      data: picking,
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

export async function actionStockPickingConfirm({ data }: { data: StockPickingSchemaType }): Promise<ActionResponse<boolean>> {
  try {
    const { company } = await sessionStore();

    if (data.saleId?.id === undefined) {
      if (data.companyId !== company.id) {
        throw new Error("La empresa destino debe confirmar el documento");
      }
    }

    const internal = await prisma.warehouse.findFirst({
      where: {
        id: data.whDestId.id,
        InternalsFrom: {
          some: {
            id: {
              in: [data.whId.id],
            },
          },
        },
      },
    });

    if (!internal) {
      throw new Error(`${data.whDestId.name} no acepta operaciones internas por parte de ${data.whId.name}`);
    }

    // VERIFICA SI EL ALMACÉN PERMITE RESERVAS SIN STOCK

    const wh = await prisma.warehouse.findFirst({
      where: {
        id: data.whId.id,
      },
    });

    if (wh && !wh.reserveQtyWs) {
      for (const line of data.PickingLine) {
        const stock = await prisma.stockWarehouse.findUnique({
          where: {
            productId_warehouseId: {
              productId: line.productId.id,
              warehouseId: data.whId.id,
            },
          },
          include: {
            Product: {
              select: {
                id: true,
                name: true,
                Uom: { select: { id: true, code: true } },
              },
            },
            Warehouse: {
              select: { reserveQtyWs: true },
            },
          },
        });

        if (!stock) {
          throw new Error(`${line.productId.name} no cuenta con existencia en el almacén de origen`);
        }

        const qyAvailable = round(stock.qty - stock.reservedQty, 3);

        if (qyAvailable < line.quantity) {
          throw new Error(`${line.productId.name} no cuenta con cantidad disponible para complementar la demanda solicitada.\n Disponible: ${qyAvailable} ${stock.Product.Uom?.code}`);
        }
      }
    }

    for (const line of data.PickingLine) {
      const resReserved = await stockWarehouseReserve({
        data: {
          productId: { id: line.productId.id, name: line.productId.name },
          qty: line.quantity,
          whId: data.whId.id,
        },
      });

      if (!resReserved.success) {
        throw new Error(resReserved.message);
      }
    }

    const newData: StockPickingSchemaType = {
      ...data,
      PickingLine: data.PickingLine.map((line) => {
        return {
          ...line,
          delivered: line.quantity,
        };
      }),
    };

    const res = await actionStockPicking({ data: newData });
    if (!res.success) {
      throw new Error(res.message);
    }

    if (!res.success || !res.data) {
      throw new Error(res.message);
    }

    return {
      message: "Acción terminada",
      success: true,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
      data: false,
    };
  }
}

export async function actionStockPickingReady({ data }: { data: StockPickingSchemaType }): Promise<ActionResponse<boolean>> {
  try {
    const { company } = await sessionStore();

    if (data.companyOriginId !== company.id) {
      throw new Error("La empresa origen debe colocar el documento listo");
    }

    if (data.operatorId?.id == undefined) {
      throw new Error("El campo operador es requerido");
    }

    for (const line of data.PickingLine) {
      if (line.delivered > line.quantity) {
        throw new Error(`La cantidad entregada del producto ${line.productId.name} no debe ser mayor a la demandada.`);
      }
    }

    const res = await actionStockPicking({ data });
    if (!res.success) {
      throw new Error(res.message);
    }

    return {
      message: "Acción terminada",
      success: true,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
      data: false,
    };
  }
}

export async function actionStockPickingDone({ data }: { data: StockPickingSchemaType & { id: string | null } }): Promise<ActionResponse<boolean>> {
  try {
    const { company } = await sessionStore();

    if (data.companyId !== company.id) {
      throw new Error("La empresa destino debe terminar el documento");
    }

    const today = todayDate();
    const datePlanned = data.datePlanned === today || data.datePlanned < today;
    if (!datePlanned) {
      throw new Error(`Fecha de validación precipitada; programado para\n${data.datePlanned}`.toString());
    }

    for (const line of data.PickingLine) {
      const stock = await prisma.stockWarehouse.findUnique({
        where: {
          productId_warehouseId: {
            productId: line.productId.id,
            warehouseId: data.whId.id,
          },
        },
        include: {
          Product: {
            select: {
              id: true,
              name: true,
              Uom: { select: { id: true, code: true } },
            },
          },
          Warehouse: {
            select: { reserveQtyWs: true },
          },
        },
      });

      if (!stock) {
        throw new Error(`${line.productId.name} no cuenta con existencia en el almacén de origen`);
      }

      if (stock.qty < 0.1) {
        throw new Error(`${line.productId.name} no cuenta con cantidad disponible para complementar la demanda solicitada.\n Disponible: ${stock.qty} ${stock.Product.Uom?.code}`);
      }
    }

    const res = await actionStockPicking({ data });
    if (!res.success) {
      throw new Error(res.message);
    }

    for (const line of data.PickingLine) {
      await affectStockWarehouse({
        data: {
          name: "TRASLADO",
          productId: line.productId.id,
          qty: line.quantity,
          deliveredQty: line.delivered,
          ref: data.name,
          docLink: `/app/stock_picking?view_type=form&id=${data.id}`,
          warehouseDestId: {
            companyDestId: res.data?.companyDestId || "",
            whDestId: res.data?.whDestId || "",
          },
          warehouseId: {
            companyOringId: res.data?.companyOriginId!,
            whId: res.data?.whId!,
          },
        },
      });
    }

    let stockValue = 0;

    for (const product of data.PickingLine) {
      const productId = await prisma.productTemplate.findUnique({
        where: {
          id: product.productId.id,
        },
      });
      if (productId) {
        stockValue += product.delivered * productId.lastCost;
      }
    }

    // relaciona stock move con diario de valoración de inventario
    // si la empresa origen es la misma, no se genera valoración
    if (data.operationType === "internal") {
      if (data.companyOriginId !== company.id) {
        const warehouseId = await prisma.warehouse.findFirst({
          where: { id: data.whDestId.id },
        });
        if (warehouseId && warehouseId.journalId) {
          await prisma.invoicingJournalEntry.create({
            data: {
              journalId: warehouseId.journalId,
              reference: data.name,
              stockpickingId: data.id,
              JournalLines: {
                create: [
                  {
                    concept: "inventory",
                    debit: round(stockValue, 2),
                    credit: 0,
                  },
                  {
                    concept: "stockReceived",
                    debit: 0,
                    credit: round(stockValue, 2),
                  },
                ],
              },
            },
          });
        }
      }
    } else if (data.operationType === "incoming") {
      const warehouseId = await prisma.warehouse.findFirst({
        where: { id: data.whDestId.id },
      });
      if (warehouseId && warehouseId.journalId) {
        await prisma.invoicingJournalEntry.create({
          data: {
            journalId: warehouseId.journalId,
            reference: data.name,
            stockpickingId: data.id,
            JournalLines: {
              create: [
                {
                  concept: "inventory",
                  debit: round(stockValue, 2),
                  credit: 0,
                },
                {
                  concept: "stockReceived",
                  debit: 0,
                  credit: round(stockValue, 2),
                },
              ],
            },
          },
        });
      }
    } else if (data.operationType === "outgoing") {
      const warehouseId = await prisma.warehouse.findFirst({
        where: { id: data.whId.id },
      });
      if (warehouseId && warehouseId.journalId) {
        await prisma.invoicingJournalEntry.create({
          data: {
            journalId: warehouseId.journalId,
            reference: data.name,
            stockpickingId: data.id,
            JournalLines: {
              create: [
                {
                  concept: "costOfSales",
                  debit: 0,
                  credit: round(stockValue, 2),
                },
                {
                  concept: "inventory",
                  debit: round(stockValue, 2),
                  credit: 0,
                },
              ],
            },
          },
        });
      }
    }

    // si la operación viene de una orden de compra
    if (data.purchaseId?.id !== undefined) {
      const hasPending = data.PickingLine.some((line) => line.quantity !== line.delivered);

      await prisma.purchaseOrder.update({
        where: {
          id: data.purchaseId.id,
        },
        data: hasPending
          ? {
              state: "pending",
            }
          : {
              state: "done",
              doneDate: new Date().toISOString(),
            },
      });
    }

    // si la operación viene de una orden de venta
    if (data.saleId?.id !== undefined) {
    }

    return {
      message: "Acción terminada",
      success: true,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
      data: false,
    };
  }
}

export async function actionStockPickingCancel({ data }: { data: StockPickingSchemaType & { id: string | null } }): Promise<ActionResponse<boolean>> {
  try {
    const { company } = await sessionStore();

    const picking = await getStockPickingById({ id: data.id });
    if (!picking) throw new Error("Operación no encontrada");

    if (data.companyId !== company.id) {
      throw new Error("La empresa destino debe cancelar el documento");
    }

    if (picking.state === "done") {
      throw new Error("No es posible cancelar el documento una vez termiando el proceso de traslado; en su lugar, solicita una Devolución");
    }

    for (const line of data.PickingLine) {
      await stockWarehouseReserveCancel({
        data: {
          productId: line.productId.id,
          qty: line.quantity,
          whId: data.whId.id,
        },
      });
    }

    const res = await actionStockPicking({ data });
    if (!res.success) {
      throw new Error(res.message);
    }

    return {
      message: "Acción terminada",
      success: true,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
      data: false,
    };
  }
}
