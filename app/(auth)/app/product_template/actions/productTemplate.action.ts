"use server";

import type { ProductTemplate } from "@/generated/prisma/client";
import { ProductTemplateSchemaType } from "../schemas/productTemplate.schema";
import prisma from "@/app/libs/prisma";
import { sessionStore } from "@/app/libs/sessionStore";
import { ActionResponse } from "@/app/libs/definitions";
import { createAuditlog } from "../../actions/auditlog-actions";

export interface ProductTemplateWithProps extends ProductTemplate {
  Supplier: { id: string; name: string } | null;
  User: { id: string; name: string } | null;
  Tags: { id: string; name: string }[];
}

type ProductTemplateActionProps = Omit<
  ProductTemplateSchemaType,
  "createdAt" | "updatedAt" | "createdUid"
>;

export async function getProductById({
  id,
}: {
  id: string | null;
}): Promise<ProductTemplateWithProps | null> {
  try {
    if (!id) throw new Error("ID not defined");

    const product = await prisma.productTemplate.findUnique({
      where: { id },
      include: {
        Supplier: {
          select: {
            id: true,
            name: true,
          },
        },
        User: {
          select: {
            id: true,
            name: true,
          },
        },
        Tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return product;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createProduct({
  data,
}: {
  data: ProductTemplateActionProps;
}): Promise<ActionResponse<ProductTemplateWithProps>> {
  try {
    const { uid } = await sessionStore();

    const newProduct = await prisma.productTemplate.create({
      data: {
        name: `[${data.defaultCode}] ${data.description}`,
        defaultCode: data.defaultCode,
        description: data.description,
        active: data.active,
        displayType: data.displayType,
        state: data.state,
        sales: data.sales,
        purchases: data.purchases,
        imageUrl: data.imageUrl,
        price1: data.price1,
        price2: data.price2,
        price3: data.price3,
        price4: data.price4,
        price5: data.price5,
        lastCost: data.lastCost,
        weight: data.weight,
        alto: data.alto,
        ancho: data.ancho,
        largo: data.largo,
        volume: data.volume,
        Tags: { connect: data.Tags.map((t) => ({ id: t })) },
        uomIncomingAllowed: data.uomIncomingAllowed,
        uomOutgoingAllowed: data.uomOutgoingAllowed,
        ...(data.supplierId?.id && {
          Supplier: { connect: { id: data.supplierId.id } },
        }),
        ...(data.userId?.id && { User: { connect: { id: data.userId.id } } }),
        createUid: uid || "",
      },
      include: {
        Supplier: {
          select: {
            id: true,
            name: true,
          },
        },
        User: {
          select: {
            id: true,
            name: true,
          },
        },
        Tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await createAuditlog({
      action: "create",
      entityId: newProduct.id,
      entityType: "productTemplate",
      log: "Ha creado el registro",
    });

    return {
      success: true,
      message: "Se ha creado el producto",
      data: newProduct,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function updateProduct({
  id,
  data,
}: {
  id: string | null;
  data: ProductTemplateActionProps;
}): Promise<ActionResponse<ProductTemplateWithProps>> {
  try {
    if (!id) throw new Error("ID not defined");

    const updatedProduct = await prisma.productTemplate.update({
      where: { id },
      data: {
        name: `[${data.defaultCode}] ${data.description}`,
        defaultCode: data.defaultCode,
        description: data.description,
        active: data.active,
        displayType: data.displayType,
        state: data.state,
        sales: data.sales,
        purchases: data.purchases,
        imageUrl: data.imageUrl,
        price1: data.price1,
        price2: data.price2,
        price3: data.price3,
        price4: data.price4,
        price5: data.price5,
        lastCost: data.lastCost,
        weight: data.weight,
        alto: data.alto,
        ancho: data.ancho,
        largo: data.largo,
        volume: data.volume,
        Tags: { set: data.Tags.map((t) => ({ id: t })) },
        uomIncomingAllowed: data.uomIncomingAllowed,
        uomOutgoingAllowed: data.uomOutgoingAllowed,
        Supplier: data.supplierId?.id
          ? { connect: { id: data.supplierId.id } }
          : { disconnect: true },
        User: data.userId?.id
          ? { connect: { id: data.userId.id } }
          : { disconnect: true },
      },
      include: {
        Supplier: {
          select: {
            id: true,
            name: true,
          },
        },
        User: {
          select: {
            id: true,
            name: true,
          },
        },
        Tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await createAuditlog({
      action: "update",
      entityId: updatedProduct.id,
      entityType: "productTemplate",
      log: "Ha editado el registro",
    });

    return {
      success: true,
      message: "Se ha creado el producto",
      data: updatedProduct,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
