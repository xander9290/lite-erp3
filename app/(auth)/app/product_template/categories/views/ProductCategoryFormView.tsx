"use client";

import { FormView, FormViewGroup } from "@/components/templates/FormView";
import {
  createProductCategory,
  ProductCategoryWithProps,
  updateProductCategory,
} from "../actions/productCategory.action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  productCategorySchema,
  productCategorySchemaDefault,
  ProductCategorySchemaType,
} from "../schemas/productCategory.schema";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useModals } from "@/contexts/ModalContext";
import {
  FieldBoolean,
  FieldEntry,
  FieldRelation,
} from "@/components/templates/fields";
import toast from "react-hot-toast";

function ProductCategoryFormView({
  id,
  productCategory,
}: {
  id: string | null;
  productCategory: ProductCategoryWithProps | null;
}) {
  const method = useForm<ProductCategorySchemaType>({
    resolver: zodResolver(productCategorySchema),
    defaultValues: productCategorySchemaDefault,
  });

  const { reset } = method;

  const originalValuesRef = useRef<ProductCategorySchemaType | null>(null);
  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<ProductCategorySchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createProductCategory({ data });
      if (!res.success) return modalError(res.message);

      router.replace(
        `/app/product_template/categories?view_type=form&id=${res.data?.id}`,
      );
      toast.success(res.message);
    } else {
      const res = await updateProductCategory({ id, data });
      if (!res.data) return modalError(res.message);
      router.refresh();
      toast.success(res.message);
    }
  };

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  useEffect(() => {
    if (!productCategory) {
      reset(productCategorySchemaDefault);
      originalValuesRef.current = productCategorySchemaDefault;
      return;
    }

    const values: ProductCategorySchemaType = {
      name: productCategory.name,
      description: productCategory.description,
      active: productCategory.active,
      parentId: {
        id: productCategory.Parent?.id || "",
        name: productCategory.Parent?.name || "",
      },
      createdAt: productCategory.createdAt,
      createdUid: productCategory.createUid,
      updatedAt: productCategory.updatedAt,
    };
    reset(values);
    originalValuesRef.current = values;
  }, [reset, productCategory]);

  return (
    <FormView
      methods={method}
      id={id}
      cleanUrl="/app/product_template/categories?view_type=form&id=null"
      reverse={handleReverse}
      onSubmit={onSubmit}
      auditLog="productCategory"
    >
      <FormViewGroup>
        <FieldRelation
          model="productCategory"
          name="parentId"
          label="Categoría principal"
          searchColumns={[
            { field: "name", label: "Nombre" },
            { field: "active", label: "Activo", type: "boolean" },
          ]}
          domain={[
            ["parentId", "=", null],
            ["active", "=", true],
          ]}
        />
        <FieldEntry name="description" label="Descripción" />
        <FieldBoolean name="active" label="Activo" />
      </FormViewGroup>
    </FormView>
  );
}

export default ProductCategoryFormView;
