"use server";

import type { ProductTemplate } from "@/generated/prisma/client";
import { ProductTemplateSchemaType } from "../schemas/productTemplate.schema";
import prisma from "@/app/libs/prisma";

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
