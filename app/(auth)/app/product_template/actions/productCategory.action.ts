"use server";

import type {
  ProductCategory,
  ProductTemplate,
} from "@/generated/prisma/client";
import { ProductCategorySchemaType } from "../schemas/productCategory.schema";
import prisma from "@/app/libs/prisma";
import { ActionResponse } from "@/app/libs/definitions";
import { sessionStore } from "@/app/libs/sessionStore";
import { createAuditlog } from "../../actions/auditlog-actions";

export interface ProductCategoryWithProps extends ProductCategory {
  Products: { id: string; name: string }[];
  Parent: { id: string; name: string } | null;
}

type ProductCategoryActionProps = Omit<
  ProductCategorySchemaType,
  "createdAt" | "updatedAt" | "createdUid"
>;

export async function getProductCategoryById({
  id,
}: {
  id: string | null;
}): Promise<ProductCategoryWithProps | null> {
  try {
    if (!id) throw new Error("ID not defined");

    const productCategory = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        Products: {
          select: {
            id: true,
            name: true,
          },
        },
        Parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return productCategory;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createProductCategory({
  data,
}: {
  data: ProductCategoryActionProps;
}): Promise<ActionResponse<any>> {
  try {
    const { uid } = await sessionStore();

    let defineName = data.description;

    if (data.parentId?.id) {
      const parentId = await getProductCategoryById({ id: data.parentId.id });
      defineName = `${parentId?.name} / ${data.description}`;
    }

    const newProductCategory = await prisma.productCategory.create({
      data: {
        name: defineName,
        description: data.description,
        ...(data.parentId?.id && {
          Parent: { connect: { id: data.parentId.id } },
        }),
        createUid: uid || "",
      },
      include: {
        Products: {
          select: {
            id: true,
            name: true,
          },
        },
        Parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await createAuditlog({
      action: "create",
      entityId: newProductCategory.id,
      log: "Ha creado el registro",
      entityType: "productCategory",
    });

    return {
      success: true,
      message: "Se ha creado el registro",
      data: newProductCategory,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
