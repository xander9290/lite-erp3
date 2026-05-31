"use client";

import type { InvoicingPaymentTerm } from "@/generated/prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { ipaymentTermSchema, ipaymentTermSchemaDefault, IPaymentTermSchemaType } from "../schema/ipaymentTerm.schema";
import { useEffect, useRef } from "react";
import { useModals } from "@/contexts/ModalContext";
import { FormView, FormViewGroup } from "@/components/templates/FormView";
import { FieldBoolean, FieldEntry } from "@/components/templates/fields";
import { createIPaymentTerm, updateIPaymentTerm } from "../actions/ipaymentTerm.action";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function IPaymentTermFormView({ id, ipaymentTerm }: { id: string | null; ipaymentTerm: InvoicingPaymentTerm | null }) {
  const methods = useForm<IPaymentTermSchemaType>({
    resolver: zodResolver(ipaymentTermSchema),
    defaultValues: ipaymentTermSchemaDefault,
  });

  const { reset } = methods;

  const router = useRouter();

  const originalValuesRef = useRef<IPaymentTermSchemaType | null>(null);

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<IPaymentTermSchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createIPaymentTerm({ data });
      if (!res.success) return modalError(res.message);
      router.replace(`/app/invoicing_settings/payment_term?view_type=form&id=${res.data?.id}`);
      toast.success(res.message);
    } else {
      const res = await updateIPaymentTerm({ id, data });
      if (!res.success) return modalError(res.message);
      router.refresh();
      toast.success(res.message);
    }
  };

  useEffect(() => {
    if (!ipaymentTerm) {
      reset(ipaymentTermSchemaDefault);
      originalValuesRef.current = ipaymentTermSchemaDefault;
      return;
    }

    const values: IPaymentTermSchemaType = {
      name: ipaymentTerm.name,
      amount: ipaymentTerm.amount,
      active: ipaymentTerm.active,
      days: ipaymentTerm.days,
    };

    reset(values);
    originalValuesRef.current = values;
  }, [reset, ipaymentTerm]);

  return (
    <FormView methods={methods} cleanUrl="/app/invoicing_settings/payment_term?view_type=form&id=null" id={id} onSubmit={onSubmit} reverse={handleReverse} auditLog="invoicingPaymentTerm">
      <FormViewGroup>
        <FieldEntry name="name" label="Nombre" />
        <FieldEntry name="days" label="Días" type="number" decimals={0} />
      </FormViewGroup>
      <FormViewGroup>
        <FieldEntry name="amount" label="Valor" type="number" decimals={0} />
        <FieldBoolean name="active" label="Activo" />
      </FormViewGroup>
    </FormView>
  );
}

export default IPaymentTermFormView;
