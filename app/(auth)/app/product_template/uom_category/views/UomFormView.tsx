"use client";

import { createUom, UomWithProps, updateUom } from "../actions/uom.action";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UomSchema, uomSchemaDefault, UomSchemaType } from "../schemas/uom.schema";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useModals } from "@/contexts/ModalContext";
import { FormView, FormViewGroup } from "@/components/templates/FormView";
import { FieldBoolean, FieldEntry } from "@/components/templates/fields";
import toast from "react-hot-toast";

function UomFormView({ uom, id }: { uom: UomWithProps | null; id: string | null }) {
  const methods = useForm<UomSchemaType>({
    resolver: zodResolver(UomSchema),
    defaultValues: uomSchemaDefault,
  });

  const { reset } = methods;

  const router = useRouter();
  const originalValuesRef = useRef<UomSchemaType | null>(null);

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<UomSchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createUom({ data });
      if (!res.success) return modalError(res.message);
      router.replace(`/app/product_template/uom_category?view_type=form&id=${res.data?.id}`);
      toast.success(res.message);
    } else {
      const res = await updateUom({ id, data });
      if (!res.success) return modalError(res.message);
      router.refresh();
      toast.success(res.message);
    }
  };

  useEffect(() => {
    if (!uom) {
      reset(uomSchemaDefault);
      originalValuesRef.current = uomSchemaDefault;
      return;
    }

    const values: UomSchemaType = {
      name: uom.name,
      description: uom.description,
      code: uom.code,
      ratio: uom.ratio,
      active: uom.active,
      Products: uom.Products.map((p) => ({ id: p.id, name: p.name })),
      createdAt: uom.createdAt,
      updatedAt: uom.updatedAt,
      createdUid: uom.createUid,
    };

    reset(values);
    originalValuesRef.current = values;
  }, [reset, uom]);

  const actionViewProducts = () => router.push(`/app/product_template/products?view_type=list&id=null&uomId=${id}`);

  return (
    <FormView
      onSubmit={onSubmit}
      reverse={handleReverse}
      methods={methods}
      id={id}
      cleanUrl="/app/product_template/uom_category?view_type=form&id=null"
      actions={[
        {
          action: actionViewProducts,
          fieldName: "actionViewProducts",
          string: `Productos (${uom?.Products && uom.Products.length})`,
          invisible: (uom?.Products && uom.Products.length < 1) || id === "null",
          variant: "outline-primary",
        },
      ]}
      auditLog="uomCategory"
    >
      <FormViewGroup>
        <FieldEntry name="description" label="Descripción" />
        <FieldEntry name="code" label="Código" />
        <FieldEntry name="ratio" label="Proporción" type="number" />
        <FieldBoolean name="active" label="Activo" />
      </FormViewGroup>
    </FormView>
  );
}

export default UomFormView;
