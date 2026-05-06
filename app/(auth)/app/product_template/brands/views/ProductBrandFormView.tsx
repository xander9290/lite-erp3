"use client";

import {
  createProductBrand,
  ProductBrandWithProps,
  updateProductBrand,
} from "../actions/productBrand.action";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productBrandSchema,
  productBrandSchemaDefault,
  ProductBrandSchemaType,
} from "../schemas/productBrand.schema";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useModals } from "@/contexts/ModalContext";
import { FormView, FormViewGroup } from "@/components/templates/FormView";
import { FieldEntry } from "@/components/templates/fields";
import { toast } from "react-hot-toast";

function ProductBrandFormView({
  id,
  productBrand,
}: {
  id: string | null;
  productBrand: ProductBrandWithProps | null;
}) {
  const methods = useForm<ProductBrandSchemaType>({
    resolver: zodResolver(productBrandSchema),
    defaultValues: productBrandSchemaDefault,
  });

  const { reset } = methods;

  const originalValuesRef = useRef<ProductBrandSchemaType | null>(null);

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<ProductBrandSchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createProductBrand({ data });
      if (!res.success) return modalError(res.message);

      router.replace(
        `/app/product_template/brands?view_type=form&id=${res.data?.id}`,
      );
      toast.success(res.message);
    } else {
      const res = await updateProductBrand({ id, data });
      if (!res.success) return modalError(res.message);

      router.refresh();
      toast.success(res.message);
    }
  };

  const actionViewProducts = () =>
    router.push(
      `/app/product_template/products?view_type=list&id=null&brandId=${id}`,
    );

  useEffect(() => {
    if (!productBrand) {
      reset(productBrandSchemaDefault);
      originalValuesRef.current = productBrandSchemaDefault;
      return;
    }

    const values: ProductBrandSchemaType = {
      name: productBrand.name,
      description: productBrand.description,
      code: productBrand.code,
      active: productBrand.active,
      Products:
        productBrand.Products.map((p) => ({ id: p.id, name: p.name })) || [],
      createdAt: productBrand.createdAt,
      updatedAt: productBrand.updatedAt,
      createdUid: productBrand.createUid,
    };

    reset(values);
    originalValuesRef.current = values;
  }, [reset, productBrand]);

  return (
    <FormView
      cleanUrl="/app/product_template/brands?view_type=form&id=null"
      reverse={handleReverse}
      auditLog="productBrand"
      onSubmit={onSubmit}
      methods={methods}
      id={id}
      actions={[
        {
          action: actionViewProducts,
          fieldName: "actionViewProducts",
          string: `Productos (${productBrand?.Products && productBrand.Products.length})`,
          invisible:
            (productBrand?.Products && productBrand.Products.length < 1) ||
            id === "null",
          variant: "outline-primary",
        },
      ]}
    >
      <FormViewGroup>
        <FieldEntry name="description" label="Descripción" />
        <FieldEntry name="code" label="Código" />
      </FormViewGroup>
    </FormView>
  );
}

export default ProductBrandFormView;
