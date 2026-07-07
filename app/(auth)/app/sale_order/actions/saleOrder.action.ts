"use server";

import { ProductPricelistItem, SaleOrder, SaleShippingWayType } from "@/generated/prisma/client";
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
  ShippingWay: { id: string; name: string; type: SaleShippingWayType };
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
          select: { id: true, name: true, type: true },
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
        confirmedDate: data.confirmedDate ? new Date(data.confirmedDate) : null,
        obs: data.obs,
        purchaseRef: data.purchaseRef,
        reference: data.reference,
        state: data.state,
        saleUserId: data.saleUserId.id,
        partnerId: data.partnerId.id,
        partnerShippingId: data.partnerShippingId.id ? data.partnerShippingId.id : null,
        shippingWayId: data.shippingWayId.id,
        paymentTermId: data.paymentTermId.id,
        subtotal: round(
          data.SaleOrderLines.reduce((acc, line) => acc + line.subtotal, 0),
          2,
        ),
        amountTax: round(
          data.SaleOrderLines.reduce((acc, line) => acc + line.taxAmount, 0),
          2,
        ),
        total: round(
          data.SaleOrderLines.reduce((acc, line) => acc + line.total, 0),
          2,
        ),
        SaleOrderLines: {
          deleteMany: {
            id: {
              notIn: data.SaleOrderLines.filter((line) => line.id).map((l) => l.id!),
            },
          },
          update: data.SaleOrderLines.filter((line) => line.id).map((line) => ({
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
            data: data.SaleOrderLines.filter((line) => line.id === null).map((line) => ({
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
        orderDate: new Date(data.orderDate),
        obs: data.obs,
        purchaseRef: data.purchaseRef,
        confirmedDate: data.confirmedDate ? new Date(data.confirmedDate) : null,
        reference: data.reference,
        state: data.state,
        saleUserId: data.saleUserId.id,
        partnerId: data.partnerId.id,
        companyId: company.id,
        partnerShippingId: data.partnerShippingId.id ? data.partnerShippingId.id : null,
        warehouseId: data.warehouseId.id,
        shippingWayId: data.shippingWayId.id,
        paymentTermId: data.paymentTermId.id,
        SaleOrderLines: {
          createMany: {
            data: data.SaleOrderLines.map((line) => ({
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
          data.SaleOrderLines.reduce((acc, line) => acc + line.subtotal, 0),
          2,
        ),
        amountTax: round(
          data.SaleOrderLines.reduce((acc, line) => acc + line.taxAmount, 0),
          2,
        ),
        total: round(
          data.SaleOrderLines.reduce((acc, line) => acc + line.total, 0),
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
          select: { id: true, name: true, type: true },
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

export async function actionSaleConfirm({ data }: { data: SaleOrderWithProps }): Promise<ActionResponse<boolean>> {
  try {
    console.log(":::Action Sale Confirm:::");
    for (const line of data.SaleOrderLines) {
      console.log("-Obtiendo información del producto:", line.Product.name);
      const productId = await prisma.productTemplate.findUnique({
        where: {
          id: line.Product.id,
        },
        include: {
          Stocks: true,
          ReceiptLines: {
            select: {
              qty: true,
              Product: {
                select: {
                  id: true,
                  name: true,
                  Stocks: true,
                },
              },
            },
          },
        },
      });

      if (!productId) throw new Error("Producto no encontrado:" + line.Product.name);

      const stock = productId.Stocks.find((stock) => stock.warehouseId === data.Warehouse.id);

      // si el tipo de produdcto es producto, se reserva cantidades
      if (productId.displayType === "PRODUCT") {
        console.log("-Validando existencias");
        if (!stock) throw new Error(`El producto ${line.Product.name} no cuenta con existencia`);

        console.log("-Calculando cantidad disponible: ", line.Product.name);
        const qtyAvailable = round(stock.qty - stock.reservedQty, 3);

        if (qtyAvailable < line.quantity) throw new Error(`El producto ${line.Product.name} no tiene suficiente existencia para cubrir la demanda ${round(line.quantity, 3)} ${line.Uom.name}`);

        console.log("-Reservando proucto para venta:", line.Product.name);
        await prisma.stockWarehouse.update({
          where: {
            productId_warehouseId: {
              productId: line.Product.id,
              warehouseId: data.Warehouse.id,
            },
          },
          data: {
            reservedQty: {
              increment: line.quantity,
            },
          },
        });
        // si el producto es elabarado, se validan o se reservan los productos de las recetas
      } else if (productId.displayType === "BOM") {
        console.log("-Validando producto elaborado");

        for (const receipt of productId.ReceiptLines) {
          const stock = receipt.Product.Stocks.find((stock) => stock.warehouseId === data.Warehouse.id);
          if (!stock) throw new Error(`El producto ${receipt.Product.name} no cuenta con (existencia actual) para cubrir la elaboración de ${productId.name}`);

          console.log("-Calculado cantidad disponible del componente:", receipt.Product.name);
          const demanda = round(receipt.qty * line.quantity, 3);
          const qtyAvailable = round(stock.qty - stock.reservedQty, 3);

          console.log("-Validando demanda del componente:", receipt.Product.name);
          if (qtyAvailable < demanda) throw new Error(`El producto ${receipt.Product.name} no cuenta con (existencia suficiente) para cubrir la elaboración de ${productId.name}`);

          console.log("-Reservando cantidad del componente: ", receipt.Product.name);
          await prisma.stockWarehouse.update({
            where: {
              productId_warehouseId: {
                productId: receipt.Product.id,
                warehouseId: data.Warehouse.id,
              },
            },
            data: {
              reservedQty: {
                increment: demanda,
              },
            },
          });
        }
      } else {
        throw new Error("Tipo de producto no encontrado");
      }

      console.log("-Cambiando estado de la línea (Reservado)");
      if (!line.id) throw new Error("ID line not defined");
      await prisma.saleOrderLine.update({
        where: {
          id: line.id,
        },
        data: {
          state: "reserved",
        },
      });
    }

    return {
      message: "Se ha compeletado la acción",
      success: true,
      data: true,
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

export async function actionSaleCancel({ data }: { data: SaleOrderSchemaType }): Promise<ActionResponse<boolean>> {
  try {
    console.log(":::Action Sale Cancel:::");
    console.log("-Obteniendo líneas de la orden");
    const lines = await prisma.saleOrderLine.findMany({
      where: {
        SaleOrder: {
          name: data.name,
        },
        state: {
          notIn: ["pending", "cancel"],
        },
      },
      include: {
        SaleOrder: {
          select: {
            state: true,
          },
        },
        Product: {
          select: {
            id: true,
            state: true,
            displayType: true,
            ReceiptLines: {
              select: {
                id: true,
                qty: true,
                Product: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // si la orden es venta, los productos deberían estar reserved
    if (lines[0].SaleOrder.state === "sale") {
      for (const line of lines) {
        // se evalúa el tipo de producto
        console.log("-Anunlando reservas");
        if (line.Product.displayType === "PRODUCT") {
          await prisma.stockWarehouse.update({
            where: {
              productId_warehouseId: {
                productId: line.Product.id,
                warehouseId: data.warehouseId.id,
              },
            },
            data: {
              reservedQty: {
                decrement: line.quantity,
              },
            },
          });
        } else if (line.Product.displayType === "BOM") {
          const receiptLines = line.Product.ReceiptLines;
          for (const reLine of receiptLines) {
            const factor = round(reLine.qty * line.quantity, 3);
            await prisma.stockWarehouse.update({
              where: {
                productId_warehouseId: {
                  productId: reLine.Product.id,
                  warehouseId: data.warehouseId.id,
                },
              },
              data: {
                reservedQty: {
                  decrement: factor,
                },
              },
            });
          }
        }
      }
      // si la orden está terminada, los productos deberían estar como delivered
    } else if (lines[0].SaleOrder.state === "done") {
    }

    return {
      success: true,
      message: "Acción completada",
      data: true,
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}
