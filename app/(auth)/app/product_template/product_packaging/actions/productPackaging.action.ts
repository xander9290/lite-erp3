"use server";

import type { ProductPackaging } from "@/generated/prisma/client";
import { ProductPackagingSchemaType } from "../schemas/productPackaging.schema";
import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import { sessionStore } from "@/app/libs/sessionStore";
import { createAuditlog } from "../../../actions/auditlog-actions";

export interface ProductPackagingWithProps extends ProductPackaging {
  ProductPackagingLines: {
    id: string;
    ProductPackaging: { id: string; name: string };
    Product: { id: string; name: string };
    qty: number;
  }[];
}

export type ProductPackagingActionProps = Omit<ProductPackagingSchemaType, "createdAt" | "createdUid" | "updatedAt">;

export async function getProductPackagingById({ id }: { id: string | null }): Promise<ProductPackagingWithProps | null> {
  try {
    if (!id) throw new Error("ID not defined");

    const packaging = await prisma.productPackaging.findUnique({
      where: { id },
      include: {
        ProductPackagingLines: {
          select: {
            id: true,
            ProductPackaging: {
              select: { id: true, name: true },
            },
            Product: {
              select: { id: true, name: true },
            },
            qty: true,
          },
        },
      },
    });

    return packaging;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createPackagingCategory({ data }: { data: ProductPackagingActionProps }): Promise<ActionResponse<ProductPackagingWithProps>> {
  try {
    const { uid } = await sessionStore();

    const newPackaging = await prisma.productPackaging.create({
      data: {
        name: data.name,
        active: data.active,
        createUid: uid || "",
      },
      include: {
        ProductPackagingLines: {
          select: {
            id: true,
            ProductPackaging: {
              select: { id: true, name: true },
            },
            Product: {
              select: { id: true, name: true },
            },
            qty: true,
          },
        },
      },
    });

    await createAuditlog({
      action: "create",
      entityId: newPackaging.id,
      entityType: "productPackaging",
      log: "Ha creado el registro",
    });

    return {
      success: true,
      message: "Se ha creado el registro",
      data: newPackaging,
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

export async function updatePackagingCategory({ id, data }: { id: string | null; data: ProductPackagingActionProps }): Promise<ActionResponse<ProductPackagingWithProps>> {
  try {
    if (!id) throw new Error("ID not defined");

    const updatedPackaging = await prisma.productPackaging.update({
      where: { id },
      data: {
        name: data.name,
        active: data.active,
      },
      include: {
        ProductPackagingLines: {
          select: {
            id: true,
            ProductPackaging: {
              select: { id: true, name: true },
            },
            Product: {
              select: { id: true, name: true },
            },
            qty: true,
          },
        },
      },
    });

    await createAuditlog({
      action: "update",
      entityId: updatedPackaging.id,
      entityType: "productPackaging",
      log: "Ha editado el registro",
    });

    return {
      success: true,
      message: "Se ha editado el registro",
      data: updatedPackaging,
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
}
