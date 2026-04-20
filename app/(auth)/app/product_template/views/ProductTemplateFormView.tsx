"use client";

import { ProductTemplateWithProps } from "../actions/productTemplate.action";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productTemplateSchema,
  productTemplateSchemaDefault,
  ProductTemplateSchemaType,
} from "../schemas/productTemplate.schema";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useModals } from "@/contexts/ModalContext";

function ProductTemplateFormView({
  id,
  product,
}: {
  id: string | null;
  product: ProductTemplateWithProps | null;
}) {
  const methods = useForm<ProductTemplateSchemaType>({
    resolver: zodResolver(productTemplateSchema),
    defaultValues: productTemplateSchemaDefault,
  });

  const { reset } = methods;

  const originalValuesRef = useRef<ProductTemplateSchemaType | null>(null);
  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<ProductTemplateSchemaType> = async (data) => {};

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  useEffect(() => {
    if (!product) {
      reset(productTemplateSchemaDefault);
      originalValuesRef.current = productTemplateSchemaDefault;
      return;
    }

    const values: ProductTemplateSchemaType = {
      name: product.name,
      description: product.description,
      defaultCode: product.defaultCode,
      active: product.active,
      sales: product.sales,
      purchases: product.purchases,
      displayType: product.displayType,
      imageUrl: product.imageUrl,
      lastCost: product.lastCost,
      price1: product.price1,
      price2: product.price2,
      price3: product.price3,
      price4: product.price4,
      price5: product.price5,
      alto: product.alto,
      ancho: product.ancho,
      largo: product.largo,
      weight: product.weight,
      volume: product.volume,
      supplierId: {
        id: product.Supplier?.id || "",
        name: product.Supplier?.name || "",
      },
      userId: { id: product.User?.id || "", name: product.User?.name || "" },
      uomIncomingAllowed: product.uomIncomingAllowed,
      uomOutgoingAllowed: product.uomOutgoingAllowed,
      Tags: product.Tags.map((t) => ({ id: t.id, name: t.name })) || [],
      createdAt: product.createdAt,
      createdUid: product.createUid,
      updatedAt: product.updatedAt,
    };
  }, [product, reset]);

  return <div>ProductTemplateFormView</div>;
}

export default ProductTemplateFormView;
