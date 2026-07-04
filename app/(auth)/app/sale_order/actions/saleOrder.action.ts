"use server";

import { ProductPricelistItem, SaleOrder } from "@/generated/prisma/client";
import { SaleOrderSchemaType } from "../schemas/saleOrder.schema";
import prisma from "@/app/libs/prisma";
import { ActionResponse } from "@/app/libs/definitions";
import { sessionStore } from "@/app/libs/sessionStore";
import { getNextValue } from "@/app/libs/sequence";
import { createAuditlog } from "../../actions/auditlog-actions";
import { round } from "@/app/libs/helpers";

export interface SaleOrderWithProps extends SaleOrder {
  SaleUser: { id: string; name: string };
  Partner: {
    id: string;
    name: string;
    productPricelist: ProductPricelistItem | null;
  };
  PartnerShipping: { id: string; name: string } | null;
  Warehouse: { id: string; name: string };
  ShippingWay: { id: string; name: string };
  Company: { id: string; name: string };
  PaymentTerm: { id: string; name: string };
  SaleOrderLines: {
    id: string | null;
    Product: { id: string; name: string };
    quantity: number;
    Uom: { id: string; name: string; code: string };
    pricelist: ProductPricelistItem;
    priceUnit: number;
    subtotal: number;
    total: number;
    taxRate: number;
    taxAmount: number;
  }[];
}

export async function getSaleOrderById({
  id,
}: {
  id: string | null;
}): Promise<SaleOrderWithProps | null> {
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
            productPricelist: true,
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
        PaymentTerm: {
          select: { id: true, name: true },
        },
        SaleOrderLines: {
          select: {
            id: true,
            Product: {
              select: { id: true, name: true },
            },
            quantity: true,
            Uom: { select: { id: true, name: true, code: true } },
            pricelist: true,
            priceUnit: true,
            subtotal: true,
            total: true,
            taxRate: true,
            taxAmount: true,
          },
        },
      },
    });

    return saleOrder;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function actionSaleOrder({
  data,
}: {
  data: SaleOrderSchemaType;
}): Promise<ActionResponse<SaleOrderWithProps>> {
  try {
    const { uid, company } = await sessionStore();

    let newName = "";
    if (!data.name) {
      newName = await getNextValue(
        `S/${company.code}/`,
        `${company.code}-saleOrder`,
      );
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
        partnerShippingId: data.partnerShippingId.id
          ? data.partnerShippingId.id
          : null,
        shippingWayId: data.shippingWayId.id,
        paymentTermId: data.paymentTermId.id,
        subtotal: round(
          data.orderLine.reduce((acc, line) => acc + line.subtotal, 0),
          2,
        ),
        amountTax: round(
          data.orderLine.reduce((acc, line) => acc + line.taxAmount, 0),
          2,
        ),
        total: round(
          data.orderLine.reduce((acc, line) => acc + line.total, 0),
          2,
        ),
        SaleOrderLines: {
          deleteMany: {
            id: {
              notIn: data.orderLine.filter((line) => line.id).map((l) => l.id!),
            },
          },
          update: data.orderLine
            .filter((line) => line.id)
            .map((line) => ({
              where: {
                id: line.id!,
              },
              data: {
                productId: line.productId.id,
                quantity: line.quantity,
                uomId: line.uomId.id,
                pricelist: line.pricelist,
                priceUnit: line.priceUnit,
                subtotal: round(line.subtotal, 2),
                total: round(line.total, 2),
                taxRate: round(line.taxRate, 2),
                taxAmount: round(line.taxAmount, 2),
              },
            })),
          createMany: {
            data: data.orderLine
              .filter((line) => line.id === null)
              .map((line) => ({
                productId: line.productId.id,
                quantity: line.quantity,
                uomId: line.uomId.id,
                pricelist: line.pricelist,
                priceUnit: line.priceUnit,
                subtotal: round(line.subtotal, 2),
                total: round(line.total, 2),
                taxRate: round(line.taxRate, 2),
                taxAmount: round(line.taxAmount, 2),
                createUid: uid!,
              })),
          },
        },
      },
      create: {
        name: newName,
        orderDate: data.orderDate,
        obs: data.obs,
        purchaseRef: data.purchaseRef,
        reference: data.reference,
        state: data.state,
        saleUserId: data.saleUserId.id,
        partnerId: data.partnerId.id,
        companyId: company.id,
        partnerShippingId: data.partnerShippingId.id
          ? data.partnerShippingId.id
          : null,
        warehouseId: data.warehouseId.id,
        shippingWayId: data.shippingWayId.id,
        paymentTermId: data.paymentTermId.id,
        SaleOrderLines: {
          createMany: {
            data: data.orderLine.map((line) => ({
              productId: line.productId.id,
              quantity: line.quantity,
              uomId: line.uomId.id,
              pricelist: line.pricelist,
              priceUnit: line.priceUnit,
              subtotal: round(line.subtotal, 2),
              total: round(line.total, 2),
              taxRate: round(line.taxRate, 2),
              taxAmount: round(line.taxAmount, 2),
              createUid: uid!,
            })),
          },
        },
        subtotal: round(
          data.orderLine.reduce((acc, line) => acc + line.subtotal, 0),
          2,
        ),
        amountTax: round(
          data.orderLine.reduce((acc, line) => acc + line.taxAmount, 0),
          2,
        ),
        total: round(
          data.orderLine.reduce((acc, line) => acc + line.total, 0),
          2,
        ),
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
            productPricelist: true,
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
        PaymentTerm: {
          select: { id: true, name: true },
        },
        SaleOrderLines: {
          select: {
            id: true,
            Product: {
              select: { id: true, name: true },
            },
            quantity: true,
            Uom: { select: { id: true, name: true, code: true } },
            pricelist: true,
            priceUnit: true,
            subtotal: true,
            total: true,
            taxRate: true,
            taxAmount: true,
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
