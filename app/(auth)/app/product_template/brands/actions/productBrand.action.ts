"use server";

import type { ProductBrand } from "@/generated/prisma/client";
import { ProductBrandSchemaType } from "../schemas/productBrand.schema";
import prisma from "@/app/libs/prisma";
import { sessionStore } from "@/app/libs/sessionStore";
import { ActionResponse } from "@/app/libs/definitions";
import { createAuditlog } from "../../../actions/auditlog-actions";
import { serverLog } from "@/app/libs/helpers";

export interface ProductBrandWithProps extends ProductBrand {
  Products: { id: string; name: string }[];
}

export type ProductBrandActionProps = Omit<ProductBrandSchemaType, "createdAt" | "updatedAt" | "createdUid">;

export async function getProductBrandById({ id }: { id: string | null }): Promise<ProductBrandWithProps | null> {
  try {
    if (!id) throw new Error("ID not defined");

    const productBrand = await prisma.productBrand.findUnique({
      where: { id },
      include: {
        Products: {
          select: { id: true, name: true },
        },
      },
    });

    serverLog({ action: "Fetching", model: "product brand", data: productBrand });
    return productBrand;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createProductBrand({ data }: { data: ProductBrandActionProps }): Promise<ActionResponse<ProductBrandWithProps>> {
  try {
    const { uid } = await sessionStore();

    serverLog({ action: "Creating", model: "product brand", data });
    const newProductBrand = await prisma.productBrand.create({
      data: {
        name: `[${data.code}] ${data.description}`,
        code: data.code,
        description: data.description,
        active: data.active,
        createUid: uid || "",
      },
      include: {
        Products: {
          select: { id: true, name: true },
        },
      },
    });

    await createAuditlog({
      action: "create",
      entityId: newProductBrand.id,
      entityType: "productBrand",
      log: "Ha creado el registro",
    });

    return {
      success: true,
      message: "Se ha creado el registro",
      data: newProductBrand,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function updateProductBrand({ id, data }: { id: string | null; data: ProductBrandActionProps }): Promise<ActionResponse<ProductBrandWithProps>> {
  try {
    if (!id) throw new Error("ID not defined");

    const newName = `[${data.code}] ${data.description}`;

    serverLog({ action: "Updating", model: "product brand", data });
    const updatedProductBrand = await prisma.productBrand.update({
      where: { id },
      data: {
        name: newName,
        code: data.code,
        description: data.description,
        active: data.active,
      },
      include: {
        Products: {
          select: { id: true, name: true },
        },
      },
    });

    await createAuditlog({
      action: "update",
      entityId: updatedProductBrand.id,
      entityType: "productBrand",
      log: "Ha editado el registro",
    });

    return {
      success: true,
      message: "Se ha editado el registro",
      data: updatedProductBrand,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
