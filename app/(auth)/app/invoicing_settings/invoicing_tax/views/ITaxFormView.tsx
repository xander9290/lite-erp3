"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoicingTaxSchema, invoicingTaxSchemaDefault, InvoicinTaxSchemaType } from "../schemas/invoicingTax.schema";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useModals } from "@/contexts/ModalContext";
import { createInvoicingTax, updateInvoicingTax } from "../action/invoicingTax.action";
import toast from "react-hot-toast";
import { InvoicingTax } from "@/generated/prisma/client";
import { FormView, FormViewGroup } from "@/components/templates/FormView";
import { FieldBoolean, FieldEntry, FieldSelect } from "@/components/templates/fields";

function ITaxFormView({ id, invoicingTax }: { id: string | null; invoicingTax: InvoicingTax | null }) {
  const methods = useForm<InvoicinTaxSchemaType>({
    resolver: zodResolver(invoicingTaxSchema),
    defaultValues: invoicingTaxSchemaDefault,
  });

  const { reset } = methods;

  const router = useRouter();

  const originalValuesRef = useRef<InvoicinTaxSchemaType | null>(null);

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<InvoicinTaxSchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createInvoicingTax({ data });
      if (!res.success) return modalError(res.message);
      router.replace(`/app/invoicing_settings/invoicing_tax?view_type=form&id=${res.data?.id}`);
      toast.success(res.message);
    } else {
      const res = await updateInvoicingTax({ id, data });
      if (!res.success) return modalError(res.message);
      router.refresh();
      toast.success(res.message);
    }
  };

  useEffect(() => {
    if (!invoicingTax) {
      reset(invoicingTaxSchemaDefault);
      originalValuesRef.current = invoicingTaxSchemaDefault;
      return;
    }

    const values: InvoicinTaxSchemaType = {
      name: invoicingTax.name,
      active: invoicingTax.active,
      amount: invoicingTax.amount,
      description: invoicingTax.description,
      typeUse: invoicingTax.typeUse,
    };

    reset(values);
    originalValuesRef.current = values;
  }, [reset, invoicingTax]);

  return (
    <FormView auditLog="invoicingTax" reverse={handleReverse} onSubmit={onSubmit} id={id} methods={methods} cleanUrl="/app/invoicing_settings/invoicing_tax?view_type=form&id=null">
      <FormViewGroup>
        <FieldEntry name="name" label="Nombre" />
        <FieldEntry name="description" label="Descripción" />
        <FieldBoolean name="active" label="Activo" />
      </FormViewGroup>
      <FormViewGroup>
        <FieldEntry name="amount" label="Importe" type="number" decimals={2} />
        <FieldSelect
          name="typeUse"
          label="Tipo"
          options={[
            { label: "Ventas", value: "sale" },
            { label: "Compras", value: "purchase" },
          ]}
        />
      </FormViewGroup>
    </FormView>
  );
}

export default ITaxFormView;
