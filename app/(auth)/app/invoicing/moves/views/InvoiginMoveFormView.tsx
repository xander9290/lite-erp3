"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import {
  invoiceMoveSchema,
  invoiceMoveSchemaDefault,
  InvoiceMoveSchemaType,
} from "../schemas/invoiceMove.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useModals } from "@/contexts/ModalContext";
import { InvoiceMoveWithProps } from "../actions/invoiceMode.action";
import { toDateOnly } from "@/app/libs/validatorDate";
import {
  FormView,
  FormViewGroup,
  FormViewStack,
} from "@/components/templates/FormView";
import { FieldRelation, FieldSelect } from "@/components/templates/fields";
import { useSearchParams } from "next/navigation";

function InvoiginMoveFormView({
  invoiceMove,
  id,
}: {
  invoiceMove: InvoiceMoveWithProps | null;
  id: string | null;
}) {
  const searchParams = useSearchParams();
  const displayType = searchParams.get("display_type") || "customer";

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

  const onSubmit: SubmitHandler<InvoiceMoveSchemaType> = async (data) => {};

  const onchagePartnerId = (value: string | null) => {
    setValue("partnerShippingId", { id: "", name: "" });
    if (value) {
      setPartnerId(value);
    } else {
      setPartnerId(null);
      setValue("partnerShippingId", { id: "", name: "" });
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
            {
              field: "name",
              label: "Nombre",
            },
            {
              field: "phone",
              label: "Teléfono",
            },
            {
              field: "completeAddress",
              label: "Dirección",
            },
            {
              field: "active",
              label: "Activo",
              type: "boolean",
            },
          ]}
          ponChange={(value) => onchagePartnerId(value)}
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
            {
              field: "name",
              label: "Nombre",
            },
            {
              field: "phone",
              label: "Teléfono",
            },
            {
              field: "completeAddress",
              label: "Dirección",
            },
            {
              field: "active",
              label: "Activo",
              type: "boolean",
            },
          ]}
        />
        <FormViewStack>
          <FieldSelect
            name="paymentForm"
            options={[
              {
                label: "PPD",
                value: "PPD",
              },
              {
                label: "PUE",
                value: "PUE",
              },
              {
                label: "PPD",
                value: "PPD",
              },
              {
                label: "PUE",
                value: "PUE",
              },
              {
                label: "PPD",
                value: "PPD",
              },
              {
                label: "PUE",
                value: "PUE",
              },
            ]}
            label="Política de pago"
          />
          <FieldSelect
            name="paymentPolicy"
            options={[
              {
                label: "PPD",
                value: "PPD",
              },
              {
                label: "PUE",
                value: "PUE",
              },
            ]}
            label="Política de pago"
          />
        </FormViewStack>
      </FormViewGroup>
    </FormView>
  );
}

export default InvoiginMoveFormView;
