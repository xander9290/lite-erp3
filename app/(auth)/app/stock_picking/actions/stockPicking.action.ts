"use server";

import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import { sessionStore } from "@/app/libs/sessionStore";
import { PickingOperationType, StockPicking } from "@/generated/prisma/client";
import { StockPickingSchemaType } from "../schemas/stockPicking.schema";
import { getNextValue } from "@/app/libs/sequence";
import { getWarehouseById } from "../../warehouses/actions/warehouse-actions";
import { createAuditlog } from "../../actions/auditlog-actions";

export interface StockPickingWithProps extends StockPicking {
  Warehouse: { id: string; description: string };
  WarehouseDest: { id: string; description: string };
  Partner: { id: string; name: string };
  Operator: { id: string; name: string } | null;
  Company: { id: string; name: string };
  SaleOrder: { id: string; name: string } | null;
  PurchaseOrder: { id: string; name: string } | null;
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

export async function getStockPickingById({
  id,
}: {
  id: string | null;
}): Promise<StockPickingWithProps | null> {
  try {
    if (!id) return null;

    const stock = await prisma.stockPicking.findUnique({
      where: {
        id,
      },
      include: {
        Warehouse: { select: { id: true, description: true } },
        WarehouseDest: { select: { id: true, description: true } },
        Partner: { select: { id: true, name: true } },
        Operator: { select: { id: true, name: true } },
        Company: { select: { id: true, name: true } },
        SaleOrder: { select: { id: true, name: true } },
        PurchaseOrder: { select: { id: true, name: true } },
      },
    });

    return stock;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function actionStockPicking({
  data,
}: {
  data: StockPickingSchemaType;
}): Promise<ActionResponse<StockPickingWithProps>> {
  try {
    const { uid, company } = await sessionStore();

    const whDest = await getWarehouseById({ id: data.whDestId.id });
    if (!whDest) {
      throw new Error("Almacén destino no fue encontrado");
    }

    let name = "";
    if (data.name === "new") {
      name = await getNextValue(
        `${whDest.code}/${generateOperationCode(data.operationType)}/`,
        `${whDest.Company.code}-stockpicking`,
      );
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
        opeartorId: data.operatorId?.id ? data.operatorId.id : null,
        partnerId: data.partnerId.id,
        state: data.state,
        reference: data.reference,
        whId: data.whId.id,
        whDestId: data.whDestId.id,
        companyDestId: whDest.Company.id,
      },
      create: {
        name,
        createUid: uid!,
        datePlanned: new Date(data.datePlanned),
        date: new Date(data.date),
        companyId: company.id,
        partnerId: data.partnerId.id,
        whDestId: data.whDestId.id,
        whId: data.whId.id,
        operationType: data.operationType,
        purchaseId: data.purchaseId?.id ? data.purchaseId.id : null,
        reference: data.reference,
        saleId: data.saleId?.id ? data.saleId.id : null,
        state: data.state,
        companyDestId: whDest.Company.id,
      },
      include: {
        Warehouse: { select: { id: true, description: true } },
        WarehouseDest: { select: { id: true, description: true } },
        Partner: { select: { id: true, name: true } },
        Operator: { select: { id: true, name: true } },
        Company: { select: { id: true, name: true } },
        SaleOrder: { select: { id: true, name: true } },
        PurchaseOrder: { select: { id: true, name: true } },
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

export async function actionStockPickingConfirm({
  data,
}: {
  data: StockPickingSchemaType;
}): Promise<ActionResponse<boolean>> {
  try {
    const { company } = await sessionStore();

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
