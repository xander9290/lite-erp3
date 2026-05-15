"use client";

import { createPackagingCategory, ProductPackagingWithProps, updatePackagingCategory } from "../actions/productPackaging.action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { productPackagingSchema, productPackagingSchemaDefault, ProductPackagingSchemaType } from "../schemas/productPackaging.schema";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useModals } from "@/contexts/ModalContext";
import { FormView, FormViewGroup } from "@/components/templates/FormView";
import { FieldBoolean, FieldEntry } from "@/components/templates/fields";
import toast from "react-hot-toast";

function ProductPackagingFormView({ id, packaging }: { id: string | null; packaging: ProductPackagingWithProps | null }) {
  const methods = useForm<ProductPackagingSchemaType>({
    resolver: zodResolver(productPackagingSchema),
    defaultValues: productPackagingSchemaDefault,
  });
  const { reset } = methods;
  const router = useRouter();

  const originalValuesRef = useRef<ProductPackagingSchemaType | null>(null);

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<ProductPackagingSchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createPackagingCategory({ data });
      if (!res.success) return modalError(res.message);
      router.replace(`/app/product_template/product_packaging?view_type=form&id=${res.data?.id}`);
      toast.success(res.message);
    } else {
      const res = await updatePackagingCategory({ id, data });
      if (!res.success) return modalError(res.message);
      router.refresh();
      toast.success(res.message);
    }
  };

  useEffect(() => {
    if (!packaging) {
      reset(productPackagingSchemaDefault);
      originalValuesRef.current = productPackagingSchemaDefault;
      return;
    }

    const values: ProductPackagingSchemaType = {
      name: packaging.name,
      active: packaging.active,
      packagingLine: packaging.ProductPackagingLines.map((p) => ({
        id: p.id,
        qty: p.qty,
        packagingId: { id: p.ProductPackaging.id, name: p.ProductPackaging.name },
        productId: { id: p.Product.id, name: p.Product.name },
      })),
      createdAt: packaging.createdAt,
      createdUid: packaging.createUid,
      updatedAt: packaging.updatedAt,
    };
    reset(values);
    originalValuesRef.current = values;
  }, [reset, packaging]);

  return (
    <FormView onSubmit={onSubmit} reverse={handleReverse} auditLog="productPackaging" cleanUrl="/app/product_template/product_packaging?view_type=form&id=null" id={id} methods={methods}>
      <FormViewGroup>
        <FieldEntry name="name" label="Nombre" />
        <FieldBoolean name="active" />
      </FormViewGroup>
    </FormView>
  );
}

export default ProductPackagingFormView;
