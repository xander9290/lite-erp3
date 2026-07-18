"use client";

import {
  FormView,
  FormViewGroup,
  FormViewStack,
} from "@/components/templates/FormView";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  invoicingJournalSchema,
  invoicingJournalSchemaDefault,
  InvoicingJournalSchemaType,
} from "../schema/invoicingjournal.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useModals } from "@/contexts/ModalContext";
import {
  createInvoicingJournal,
  InvoicingJournalWithProps,
  updateInvoicingJournal,
} from "../actions/invoicingjournal.action";
import {
  FieldBoolean,
  FieldEntry,
  FieldRelation,
  FieldSelect,
} from "@/components/templates/fields";
import { toast } from "react-hot-toast";

function InvoicingJournalFormView({
  id,
  journal,
}: {
  id: string | null;
  journal: InvoicingJournalWithProps | null;
}) {
  const methods = useForm<InvoicingJournalSchemaType>({
    resolver: zodResolver(invoicingJournalSchema),
    defaultValues: invoicingJournalSchemaDefault,
  });

  const { reset } = methods;

  const router = useRouter();

  const originalValuesRef = useRef<InvoicingJournalSchemaType | null>(null);

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<InvoicingJournalSchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createInvoicingJournal({ data });
      if (!res.success) return modalError(res.message);
      router.replace(
        `/app/invoicing_settings/invoicing_journal?view_type=form&id=${res.data?.id}`,
      );
      toast.success(res.message);
    } else {
      const res = await updateInvoicingJournal({ data, id });
      if (!res.success) return modalError(res.message);
      router.refresh();
      toast.success(res.message);
    }
  };

  useEffect(() => {
    if (!journal) {
      reset(invoicingJournalSchemaDefault);
      originalValuesRef.current = invoicingJournalSchemaDefault;
      return;
    }

    const values: InvoicingJournalSchemaType = {
      active: journal.active,
      code: journal.code,
      companyId: {
        id: journal.Company.id,
        name: journal.Company.name,
      },
      currencyId: {
        id: journal.Currency?.id,
        name: journal.Currency?.name,
      },
      name: journal.name,
      type: journal.type,
    };
    reset(values);
    originalValuesRef.current = values;
  }, [journal, reset, originalValuesRef]);

  return (
    <FormView
      id={id}
      methods={methods}
      onSubmit={onSubmit}
      reverse={handleReverse}
      cleanUrl="/app/invoicing_settings/invoicing_journal?view_type=form&id=null"
    >
      <FormViewGroup>
        <FieldEntry name="name" label="Nombre" />
        <FormViewStack>
          <FieldEntry name="code" label="Código" />
          <FieldSelect
            name="type"
            label="Tipo"
            options={[
              { label: "Ventas", value: "sale" },
              { label: "Compras", value: "purchase" },
              { label: "Efectivo", value: "cash" },
              { label: "Banco", value: "bank" },
              { label: "Varios", value: "general" },
            ]}
          />
        </FormViewStack>
      </FormViewGroup>
      <FormViewGroup>
        <FieldRelation model="company" name="companyId" label="Empresa" />
        <FormViewStack>
          <FieldRelation
            model="invoicingCurrency"
            name="currencyId"
            label="Moneda"
            domain={[["active", "=", true]]}
          />
          <FieldBoolean name="active" label="Activo" />
        </FormViewStack>
      </FormViewGroup>
    </FormView>
  );
}

export default InvoicingJournalFormView;
