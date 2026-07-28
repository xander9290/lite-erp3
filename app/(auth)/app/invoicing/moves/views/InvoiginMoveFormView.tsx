"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { invoiceMoveSchema, invoiceMoveSchemaDefault, InvoiceMoveSchemaType } from "../schemas/invoiceMove.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useModals } from "@/contexts/ModalContext";
import { actionInvoiceMove, InvoiceMoveWithProps } from "../actions/invoiceMode.action";
import { toDateOnly, todayDate } from "@/app/libs/validatorDate";
import { FormView, FormViewGroup, FormViewStack } from "@/components/templates/FormView";
import { FieldEntry, FieldRelation, FieldSelect } from "@/components/templates/fields";
import { useSearchParams } from "next/navigation";
import { InvoiceDisplayType, InvoicingPaymentTerm, Partner } from "@/generated/prisma/browser";
import { getIPaymentTermById } from "../../../invoicing_settings/payment_term/actions/ipaymentTerm.action";
import { addDays } from "date-fns";
import toast from "react-hot-toast";

function InvoiginMoveFormView({ invoiceMove, id }: { invoiceMove: InvoiceMoveWithProps | null; id: string | null }) {
  const searchParams = useSearchParams();
  const displayType = searchParams.get("display_type") as InvoiceDisplayType;

  const methods = useForm<InvoiceMoveSchemaType>({
    resolver: zodResolver(invoiceMoveSchema),
    defaultValues: invoiceMoveSchemaDefault,
  });

  const { reset, getValues, setValue } = methods;

  const originalValuesRef = useRef<InvoiceMoveSchemaType | null>(null);
  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };
  const router = useRouter();

  const { modalError, modalConfirm } = useModals();

  const [partnerId, setPartnerId] = useState<string | null>(null);

  const onSubmit: SubmitHandler<InvoiceMoveSchemaType> = async (data) => {
    const res = await actionInvoiceMove({ data: { ...data, displayType } });
    if (id && id === "null") {
      if (!res.success) modalError(res.message);
      router.replace(`/app/invoicing/moves?view_type=form&id=${res.data?.id}&display_type=${res.data?.displayType}`);
      toast.success(res.message);
    } else {
      router.refresh();
      toast.success(res.message);
    }
  };

  const onchagePartnerId = async (record: Partner | null) => {
    if (record) {
      setPartnerId(record.id);

      if (record.paymentTermId) {
        const paymentTermId = await getIPaymentTermById({ id: record.paymentTermId });
        if (paymentTermId) {
          setValue("paymentTermId", { id: paymentTermId.id, name: paymentTermId.name });
          setValue("invoiceDateDue", toDateOnly(addDays(todayDate(), paymentTermId.days)));
        }
      }
    } else {
      setPartnerId(null);
      setValue("partnerShippingId", { id: "", name: "" });
      setValue("paymentTermId", { id: "", name: "" });
      setValue("invoiceDateDue", "");
    }
  };

  const onchagePaymentTermId = (value: InvoicingPaymentTerm | null) => {
    if (value) {
      setValue("invoiceDateDue", toDateOnly(addDays(todayDate(), value.days)));
    } else {
      setValue("invoiceDateDue", "");
    }
  };

  useEffect(() => {
    if (!invoiceMove) {
      reset(invoiceMoveSchemaDefault);
      originalValuesRef.current = invoiceMoveSchemaDefault;
      return;
    }

    const values: InvoiceMoveSchemaType = {
      currencyId: {
        id: invoiceMove.Currency.id,
        name: invoiceMove.Currency.name,
      },
      date: toDateOnly(invoiceMove.date),
      displayType: invoiceMove.displayType,
      invoiceDate: toDateOnly(invoiceMove.invoiceDate),
      invoiceDateDue: toDateOnly(invoiceMove.invoiceDateDue),
      invoiceType: invoiceMove.invoiceType,
      journalId: {
        id: invoiceMove.Journal.id,
        name: invoiceMove.Journal.name,
      },
      name: invoiceMove.name,
      partnerId: {
        id: invoiceMove.Partner.id,
        name: invoiceMove.Partner.name,
      },
      partnerShippingId: {
        id: invoiceMove.PartnerShipping?.id,
        name: invoiceMove.PartnerShipping?.name,
      },
      paymentForm: invoiceMove.paymentForm,
      paymentPolicy: invoiceMove.paymentPolicy,
      cfdiUse: invoiceMove.cfdiUse,
      paymentTermId: {
        id: invoiceMove.PaymentTerm.id,
        name: invoiceMove.PaymentTerm.name,
      },
      reference: invoiceMove.reference,
      state: invoiceMove.state,
      subtotal: Number(invoiceMove.subtotal),
      taxAmount: Number(invoiceMove.taxAmount),
      total: Number(invoiceMove.total),
      uuidcfdi: invoiceMove.uuidcfdi,
    };

    reset(values);
    originalValuesRef.current = values;
  }, [invoiceMove, reset, originalValuesRef]);

  return (
    <FormView
      id={id}
      cleanUrl={`/app/invoicing/moves?view_type=form&id=null&display_type=${getValues().displayType}`}
      methods={methods}
      onSubmit={onSubmit}
      reverse={handleReverse}
      auditLog="invoicingInvoice"
    >
      <FormViewGroup>
        <FieldRelation
          model="partner"
          name="partnerId"
          label="Cliente"
          domain={[
            ["displayType", "=", displayType.toUpperCase()],
            ["active", "=", true],
          ]}
          searchColumns={[
            { field: "name", label: "Nombre" },
            { field: "phone", label: "Teléfono" },
            { field: "completeAddress", label: "Dirección" },
            { field: "active", label: "Activo", type: "boolean" },
          ]}
          ponChange={(_, reacord) => onchagePartnerId(reacord as Partner)}
        />
        <FieldRelation
          model="partner"
          name="partnerShippingId"
          label="Dirección de entrega"
          domain={[
            ["parentId", "=", partnerId],
            ["active", "=", true],
            ["displayType", "=", "DELIVERY"],
          ]}
          searchColumns={[
            { field: "name", label: "Nombre" },
            { field: "phone", label: "Teléfono" },
            { field: "completeAddress", label: "Dirección" },
            { field: "active", label: "Activo", type: "boolean" },
          ]}
        />
        <FormViewStack>
          <FieldSelect
            name="paymentForm"
            options={[
              { label: "Por definir", value: "undefined" },
              { label: "Efectivo", value: "cash" },
              { label: "Tarjeta de crédito", value: "creditCard" },
              { label: "Tarjeta de débito", value: "debitCard" },
              { label: "Transferencia bancaria", value: "bankTransfer" },
            ]}
            label="Forma de pago"
            placeholder=""
          />
          <FieldSelect
            name="paymentPolicy"
            options={[
              { label: "PPD", value: "PPD" },
              { label: "PUE", value: "PUE" },
            ]}
            label="Política de pago"
          />
        </FormViewStack>
        <FieldSelect
          name="cfdiUse"
          label="Uso de CFDi"
          options={[
            { label: "G01 - Adquisición de mercancías", value: "acquisition" },
            { label: "G03 - Gastos en general", value: "generalExpenses" },
            { label: "S01 - Sin efectos fiscales", value: "noTaxEffects" },
            { label: "CP01 - Pagos", value: "payments" },
          ]}
        />
      </FormViewGroup>
      <FormViewGroup>
        <FormViewStack>
          <FieldEntry type="date" name="invoiceDate" label="Fecha de factura" />
          <FieldEntry type="date" name="date" label="Fecha" readonly />
          <FieldRelation name="paymentTermId" model="invoicingPaymentTerm" label="Términos de pago" ponChange={(_, value) => onchagePaymentTermId(value as InvoicingPaymentTerm | null)} />
          <FieldEntry type="date" name="invoiceDateDue" label="Fecha de vencimiento" />
          <FieldRelation
            model="invoicingJournal"
            name="journalId"
            label="Diario"
            domain={[
              ["active", "=", true],
              ["type", "in", ["sale", "purchase"]],
            ]}
          />
          <FieldRelation model="invoicingCurrency" name="currencyId" label="Moneda" />
        </FormViewStack>
        <FieldEntry name="reference" label="Referencia" />
      </FormViewGroup>
    </FormView>
  );
}

export default InvoiginMoveFormView;
