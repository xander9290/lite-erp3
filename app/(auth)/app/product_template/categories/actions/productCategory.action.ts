"use server";

import type { ProductCategory } from "@/generated/prisma/client";
import prisma from "@/app/libs/prisma";
import { ActionResponse } from "@/app/libs/definitions";
import { sessionStore } from "@/app/libs/sessionStore";
import { createAuditlog } from "../../../actions/auditlog-actions";
import { ProductCategorySchemaType } from "../schemas/productCategory.schema";

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
}): Promise<ActionResponse<ProductCategoryWithProps>> {
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

export async function updateProductCategory({
  id,
  data,
}: {
  id: string | null;
  data: ProductCategoryActionProps;
}): Promise<ActionResponse<ProductCategoryWithProps>> {
  try {
    if (!id) throw new Error("ID not defined");

    let defineName = data.description;

    if (data.parentId?.id) {
      const parentId = await getProductCategoryById({ id: data.parentId.id });
      defineName = `${parentId?.name} / ${data.description}`;
    }

    const updatedProductCategory = await prisma.$transaction(async (tx) => {
      const productCategory = await tx.productCategory.update({
        where: { id },
        data: {
          name: defineName,
          description: data.description,
          active: data.active,
          Parent: data.parentId?.id
            ? { connect: { id: data.parentId.id } }
            : { disconnect: true },
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

      const getChildren = await tx.productCategory.findMany({
        where: {
          parentId: productCategory.id,
        },
      });

      for (const child of getChildren) {
        const childDesc = child.description;
        const newParentDesc = data.description;
        const newChildName = `${newParentDesc} / ${childDesc}`;
        await tx.productCategory.update({
          where: { id: child.id },
          data: {
            name: newChildName,
          },
        });
      }

      return productCategory;
    });

    return {
      success: true,
      message: "Se ha editado el registro",
      data: updatedProductCategory,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
