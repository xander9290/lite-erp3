"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { saleShippingWaySchema, saleShippingWaySchemaDefault, SaleShippingWaySchemaType } from "../schemas/saleShippingWay.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { saleOrderSchemaDefault } from "../../../sale_order/schemas/saleOrder.schema";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useModals } from "@/contexts/ModalContext";
import { SaleShippingWay } from "@/generated/prisma/browser";
import { FormView, FormViewGroup } from "@/components/templates/FormView";
import { FieldBoolean, FieldEntry, FieldSelect } from "@/components/templates/fields";
import toast from "react-hot-toast";
import { createSaleShippingWay, updateSaleShippingWay } from "../actions/saleShippingWay.action";

function ShippingWayFormView({ id, shippingWay }: { id: string | null; shippingWay: SaleShippingWay | null }) {
  const methods = useForm<SaleShippingWaySchemaType>({
    resolver: zodResolver(saleShippingWaySchema),
    defaultValues: saleOrderSchemaDefault,
  });

  const { reset } = methods;

  const originalValuesRef = useRef<SaleShippingWaySchemaType | null>(null);
  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };
  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<SaleShippingWaySchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createSaleShippingWay({ data });
      if (!res.success) return modalError(res.message);
      router.replace(`/app/sale_settings/sale_shipping_way?view_type=form&id=${res.data?.id}`);
      toast.success(res.message);
    } else {
      const res = await updateSaleShippingWay({ id, data });
      if (!res.success) return modalError(res.message);
      router.refresh();
      toast.success(res.message);
    }
  };

  useEffect(() => {
    if (!shippingWay) {
      reset(saleShippingWaySchemaDefault);
      originalValuesRef.current = saleShippingWaySchemaDefault;
      return;
    }

    const values: SaleShippingWaySchemaType = {
      name: shippingWay.name,
      type: shippingWay.type,
      active: shippingWay.active,
    };
    reset(values);
    originalValuesRef.current = values;
  }, [shippingWay, reset]);

  return (
    <FormView reverse={handleReverse} onSubmit={onSubmit} methods={methods} id={id} cleanUrl="/app/sale_settings/sale_shipping_way?view_type=form&id=null">
      <FormViewGroup>
        <FieldEntry name="name" label="Nombre" />
        <FieldSelect
          name="type"
          label="Tipo"
          options={[
            { value: "counter", label: "Mostrador" },
            { value: "delivery", label: "Entrega" },
            { value: "courier", label: "Paquetería" },
          ]}
        />
        <FieldBoolean name="active" label="Activo" />
      </FormViewGroup>
    </FormView>
  );
}

export default ShippingWayFormView;
