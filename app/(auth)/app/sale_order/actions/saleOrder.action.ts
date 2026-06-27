"use server";

import { SaleOrder } from "@/generated/prisma/client";
import { SaleOrderSchemaType } from "../schemas/saleOrder.schema";
import prisma from "@/app/libs/prisma";
import { ActionResponse } from "@/app/libs/definitions";
import { sessionStore } from "@/app/libs/sessionStore";
import { getNextValue } from "@/app/libs/sequence";
import { createAuditlog } from "../../actions/auditlog-actions";

export interface SaleOrderWithProps extends SaleOrder {
  SaleUser: { id: string; name: string };
  Partner: { id: string; name: string };
  PartnerShipping: { id: string; name: string } | null;
  Warehouse: { id: string; name: string };
  ShippingWay: { id: string; name: string };
  Company: { id: string; name: string };
}

export async function getSaleOrderById({ id }: { id: string | null }): Promise<SaleOrderWithProps | null> {
  try {
    if (!id) throw new Error("ID not defined");

    const saleOrder = await prisma.saleOrder.findUnique({
      where: { id },
      include: {
        SaleUser: {
          select: { id: true, name: true },
        },
        Partner: {
          select: {
            id: true,
            name: true,
          },
        },
        PartnerShipping: {
          select: {
            id: true,
            name: true,
          },
        },
        Warehouse: {
          select: { id: true, name: true },
        },
        ShippingWay: {
          select: { id: true, name: true },
        },
        Company: {
          select: { id: true, name: true },
        },
      },
    });

    return saleOrder;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function actionSaleOrder({ data }: { data: SaleOrderSchemaType }): Promise<ActionResponse<SaleOrderWithProps>> {
  try {
    const { uid, company } = await sessionStore();

    let newName = "";
    if (!data.name) {
      newName = await getNextValue(`S/${company.code}/`, `${company.code}-saleOrder`);
    }

    const saleOrder = await prisma.saleOrder.upsert({
      where: { name: data.name },
      update: {
        confirmedDate: data.confirmedDate ? data.confirmedDate : null,
        obs: data.obs,
        purchaseRef: data.purchaseRef,
        reference: data.reference,
        state: data.state,
        saleUserId: data.saleUserId.id,
        partnerId: data.partnerId.id,
        partnerShippingId: data.partnerShippingId.id,
        shippingWayId: data.shippingWayId.id,
      },
      create: {
        name: newName,
        obs: data.obs,
        purchaseRef: data.purchaseRef,
        reference: data.reference,
        state: data.state,
        saleUserId: data.saleUserId.id,
        partnerId: data.partnerId.id,
        companyId: company.id,
        partnerShippingId: data.partnerShippingId.id,
        warehouseId: data.warehouseId.id,
        shippingWayId: data.shippingWayId.id,
        createUid: uid!,
      },
      include: {
        SaleUser: {
          select: { id: true, name: true },
        },
        Partner: {
          select: {
            id: true,
            name: true,
          },
        },
        PartnerShipping: {
          select: {
            id: true,
            name: true,
          },
        },
        Warehouse: {
          select: { id: true, name: true },
        },
        ShippingWay: {
          select: { id: true, name: true },
        },
        Company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (data.name) {
      await createAuditlog({
        action: "update",
        entityId: saleOrder.id,
        entityType: "saleOder",
        log: "Ha editado el registro",
      });
    } else {
      await createAuditlog({
        action: "create",
        entityId: saleOrder.id,
        entityType: "saleOder",
        log: "Ha creado el registro",
      });
    }

    return {
      success: true,
      message: "Se ha completado la acción",
      data: saleOrder,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
