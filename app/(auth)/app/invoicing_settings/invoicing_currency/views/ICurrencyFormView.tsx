"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  icurrencySchema,
  ICurrencySchema,
  icurrencySchemaDefault,
} from "../schemas/icurrency.schema";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useModals } from "@/contexts/ModalContext";
import { FormView, FormViewGroup } from "@/components/templates/FormView";
import { FieldBoolean, FieldEntry } from "@/components/templates/fields";
import { createCurrency, updateCurrency } from "../actions/icurrency.action";
import { toast } from "react-hot-toast";

function ICurrencyFormView({
  id,
  icurrency,
}: {
  id: string | null;
  icurrency: ICurrencySchema | null;
}) {
  const methods = useForm<ICurrencySchema>({
    resolver: zodResolver(icurrencySchema),
    defaultValues: icurrencySchemaDefault,
  });

  const { reset } = methods;

  const router = useRouter();

  const originalValuesRef = useRef<ICurrencySchema | null>(null);

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<ICurrencySchema> = async (data) => {
    if (id && id === "null") {
      const res = await createCurrency({ data });
      if (!res.success) return modalError(res.message);
      router.replace(
        `/app/invoicing_settings/invoicing_currency?view_type=form&id=${res.data?.id}`,
      );
      toast.success(res.message);
    } else {
      const res = await updateCurrency({ id, data });
      if (!res.success) return modalError(res.message);
      router.refresh();
      toast.success(res.message);
    }
  };

  useEffect(() => {
    if (!icurrency) {
      reset(icurrencySchemaDefault);
      originalValuesRef.current = icurrencySchemaDefault;
      return;
    }

    const values: ICurrencySchema = {
      name: icurrency.name,
      description: icurrency.description,
      label: icurrency.label,
      symbol: icurrency.symbol,
      active: icurrency.active,
    };
    reset(values);
    originalValuesRef.current = values;
  }, [icurrency, reset]);

  return (
    <FormView
      methods={methods}
      cleanUrl="/app/invoicing_settings/invoicing_currency?view_type=form&id=null"
      id={id}
      onSubmit={onSubmit}
      reverse={handleReverse}
    >
      <FormViewGroup>
        <FieldEntry name="name" label="Nombre" />
        <FieldEntry name="description" label="Descripción" />
        <FieldBoolean name="active" label="Activo" />
      </FormViewGroup>
      <FormViewGroup>
        <FieldEntry name="symbol" label="Símbolo" />
        <FieldEntry name="label" label="Etiqueta" />
      </FormViewGroup>
    </FormView>
  );
}

export default ICurrencyFormView;
