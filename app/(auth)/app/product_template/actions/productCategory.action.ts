"use server";

import type {
  ProductCategory,
  ProductTemplate,
} from "@/generated/prisma/client";

export interface ProductCategoryWithProps extends ProductCategory {
  Products: ProductTemplate[];
}
