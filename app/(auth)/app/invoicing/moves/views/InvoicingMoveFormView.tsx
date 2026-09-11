"use client";

import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { invoiceMoveSchema, invoiceMoveSchemaDefault, InvoiceMoveSchemaType } from "../schemas/invoiceMove.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useModals } from "@/contexts/ModalContext";
import { actionInvoiceConfirm, actionInvoiceMove, InvoiceMoveWithProps } from "../actions/invoiceMode.action";
import { toDateOnly, todayDate } from "@/app/libs/validatorDate";
import { FormView, FormViewGroup, FormViewStack } from "@/components/templates/FormView";
import { FieldEntry, FieldRelation, FieldSelect } from "@/components/templates/fields";
import { useSearchParams } from "next/navigation";
import { InvoiceDisplayType, InvoicingPaymentTerm, Partner } from "@/generated/prisma/browser";
import { getIPaymentTermById } from "../../../invoicing_settings/payment_term/actions/ipaymentTerm.action";
import { addDays } from "date-fns";
import toast from "react-hot-toast";
import { Notebook, Page, PageSheet } from "@/components/templates/Notebook";
import { Col } from "react-bootstrap";
import { BtnDeleteLine, SimpleTable, SimpleTD } from "@/components/templates/simpletemplates";
import { invoiceMoveLineSchemaDefault } from "../schemas/invoiceMoveLineSchema";
import { getProductById } from "../../../product_template/products/actions/productTemplate.action";
import { formatCurrency } from "@/app/libs/helpers";

function InvoiginMoveFormView({ invoiceMove, id }: { invoiceMove: InvoiceMoveWithProps | null; id: string | null }) {
  const searchParams = useSearchParams();
  const displayType = searchParams.get("display_type") as InvoiceDisplayType;

  const methods = useForm<InvoiceMoveSchemaType>({
    resolver: zodResolver(invoiceMoveSchema),
    defaultValues: invoiceMoveSchemaDefault,
  });

  const { reset, getValues, setValue, control, handleSubmit } = methods;

  const { append, fields, remove } = useFieldArray({
    control,
    name: "InvoiceLines",
  });

  const originalValuesRef = useRef<InvoiceMoveSchemaType | null>(null);
  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };
  const router = useRouter();

  const { modalError, modalConfirm } = useModals();

  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [totals, setTotals] = useState({
    subtotal: 0.0,
    taxes: 0.0,
    total: 0.0,
  });

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

  const computeTotals = () => {
    const { InvoiceLines } = getValues();
    let subtotal = 0.0;
    let taxes = 0.0;
    let total = 0.0;
    for (const line of InvoiceLines) {
      subtotal += line.amountUntaxed;
      taxes += line.amountTax;
      total += line.amountTotal;
    }
    setTotals({ subtotal, taxes, total });
  };

  const onchagePartnerId = async (record: Partner | null) => {
    if (record) {
      setPartnerId(record.id);

      if (record.paymentTermId) {
        const paymentTermId = await getIPaymentTermById({
          id: record.paymentTermId,
        });
        if (paymentTermId) {
          setValue("paymentTermId", {
            id: paymentTermId.id,
            name: paymentTermId.name,
          });
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
      // si es pago inmediato, las fechas se colocan a la fecha actual
      if (value.days === 0) {
        setValue("invoiceDate", todayDate());
        setValue("invoiceDateDue", todayDate());
      } else {
        const invoiceDate = getValues().invoiceDate;
        setValue("invoiceDateDue", toDateOnly(addDays(invoiceDate, value.days)));
      }
    } else {
      setValue("invoiceDateDue", "");
    }
  };

  const onchangeInvoiceDate = async (value: string) => {
    const paymentTerm = getValues().paymentTermId;
    const paymentTermId = await getIPaymentTermById({ id: paymentTerm.id });
    if (paymentTermId) {
      const days = paymentTermId.days;
      setValue("invoiceDateDue", toDateOnly(addDays(value, days)));
    } else {
      setValue("invoiceDateDue", toDateOnly(addDays(todayDate(), 0)));
    }
  };

  const onchangeProduct = async ({ value, line }: { value: string | null; line: number }) => {
    const productId = await getProductById({ id: value });
    const quantity = getValues().InvoiceLines[line].quantity;
    if (productId) {
      const taxRate = displayType === "customer" ? productId.TaxSale?.amount || 0.0 : productId.TaxPurchase?.amount || 0.0;
      const priceUnit = productId.price1;
      const subtotal = quantity * priceUnit;

      const amountTotal = subtotal * (1 + taxRate);
      const amountTax = subtotal * taxRate;

      setValue(`InvoiceLines.${line}.uomId`, {
        id: productId?.Uom?.id || "",
        name: productId?.Uom?.code || "",
      });
      setValue(`InvoiceLines.${line}.priceUnit`, priceUnit);
      setValue(`InvoiceLines.${line}.amountUntaxed`, subtotal);
      setValue(`InvoiceLines.${line}.amountTotal`, amountTotal);
      setValue(`InvoiceLines.${line}.amountTax`, amountTax);
      setValue(`InvoiceLines.${line}.taxRate`, taxRate);
      setValue(`InvoiceLines.${line}.description`, productId.description);
      setValue(`InvoiceLines.${line}.defaultCode`, productId.defaultCode);
      setValue(`InvoiceLines.${line}.itemNumber`, line + 1);
      computeTotals();
    }
  };

  const onchangeQuantity = ({ line, value = 0.0 }: { line: number; value: number }) => {
    const priceUnit = getValues().InvoiceLines[line].priceUnit ?? 0.0;
    const taxRate = getValues().InvoiceLines[line].taxRate;
    const qty = value;

    const subtotal = qty * priceUnit;
    const amountTotal = subtotal * (1 + taxRate);
    const amountTax = subtotal * taxRate;

    setValue(`InvoiceLines.${line}.amountUntaxed`, subtotal);
    setValue(`InvoiceLines.${line}.amountTotal`, amountTotal);
    setValue(`InvoiceLines.${line}.amountTax`, amountTax);

    computeTotals();
  };

  const onchangePriceUnit = ({ line }: { line: number }) => {
    const qty = getValues().InvoiceLines[line].quantity;
    onchangeQuantity({ value: qty, line });

    computeTotals();
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
      paymentState: invoiceMove.paymentState,
      displayType: invoiceMove.displayType,
      invoiceDate: toDateOnly(invoiceMove.invoiceDate),
      invoiceDateDue: toDateOnly(invoiceMove.invoiceDateDue),
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
      subtotal: invoiceMove.subtotal,
      taxAmount: invoiceMove.taxAmount,
      total: invoiceMove.total,
      uuidcfdi: invoiceMove.uuidcfdi,
      InvoiceLines: invoiceMove.InvoiceLines.map((line) => ({
        amountTax: line.amountTax,
        amountTotal: line.amountTotal,
        amountUntaxed: line.amountUntaxed,
        defaultCode: line.defaultCode || "",
        description: line.description,
        discountAmount: line.discountAmount,
        taxRate: line.taxRate,
        discountPercent: line.discountPercent,
        priceUnit: line.priceUnit,
        productId: { id: line.Product.id, name: line.Product.name },
        productLastCost: line.productLastCost,
        quantity: line.quantity,
        uomId: { id: line.Uom.id, name: line.Uom.code },
        itemNumber: line.itemNumber,
      })),
    };

    reset(values);
    originalValuesRef.current = values;
    computeTotals();
  }, [invoiceMove, reset, originalValuesRef]);

  useEffect(() => computeTotals(), [fields]);

  // FORM ACTIONS

  const actionConfirm = handleSubmit(async () => {
    const newData: InvoiceMoveSchemaType = {
      ...getValues(),
    };

    const res = await actionInvoiceConfirm({ data: newData });
    if (!res.success) return modalError(res.message);
    router.refresh();
  });

  return (
    <FormView
      id={id}
      cleanUrl={`/app/invoicing/moves?view_type=form&id=null&display_type=${getValues().displayType}`}
      methods={methods}
      onSubmit={onSubmit}
      reverse={handleReverse}
      auditLog="invoicingInvoice"
      state={getValues().state}
      formStates={[
        { name: "draft", label: "Borrador", decoration: "secondary" },
        { name: "confirmed", label: "Confirmado", decoration: "primary" },
        { name: "sent", label: "Publicado", decoration: "success" },
        { name: "cancelled", label: "Cancelado", decoration: "danger" },
      ]}
      actions={[{ action: actionConfirm, fieldName: "actionConfirm", string: "Confirmar", variant: "primary", invisible: id === "null" || getValues().state !== "draft" }]}
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
          <FieldEntry type="date" name="invoiceDate" label="Fecha de factura" onChange={(value) => onchangeInvoiceDate(value)} />
          <FieldEntry type="date" name="date" label="Fecha" readonly />
          <FieldRelation name="paymentTermId" model="invoicingPaymentTerm" label="Términos de pago" ponChange={(_, value) => onchagePaymentTermId(value as InvoicingPaymentTerm | null)} />
          <FieldEntry type="date" name="invoiceDateDue" label="Fecha de vencimiento" readonly />
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
      <Notebook defaultActiveKey="invoiceLine">
        <Page eventKey="invoiceLine" title="Líneas">
          <PageSheet name="invoiceLine">
            <Col md="12" className="p-0 m-0 overflow-auto">
              <SimpleTable
                data={fields}
                headers={[
                  {
                    string: "#",
                    name: "itemNumber",
                    width: 10,
                    minWidth: 10,
                    className: "text-center",
                  },
                  ...(getValues().state !== "draft" ? [{ string: "Código", width: 25, minWidth: 20 }] : []),
                  {
                    string: getValues().state !== "draft" ? "Descripción" : "Producto",
                    name: "productId",
                    width: 300,
                    minWidth: 300,
                  },
                  {
                    string: "Cantidad",
                    name: "quantity",
                    width: 30,
                    minWidth: 30,
                  },
                  { string: "UdM", name: "uomId", width: 35, minWidth: 20 },
                  {
                    string: "Precio",
                    name: "priceUnit",
                    width: 30,
                    minWidth: 30,
                  },
                  {
                    string: "Subtotal",
                    name: "amountUntaxed",
                    width: 45,
                    minWidth: 40,
                  },
                  {
                    string: "Impuestos",
                    name: "amountTax",
                    width: 30,
                    minWidth: 30,
                  },
                  {
                    string: "Total",
                    name: "amountTotal",
                    width: 50,
                    minWidth: 50,
                  },
                  {
                    string: <i className="bi bi-trash"></i>,
                    className: "text-center",
                    width: 25,
                    minWidth: 25,
                    name: "lineDelete",
                  },
                ]}
                resizable
                renderRow={(field, index) => (
                  <tr key={field.id}>
                    <SimpleTD colIdx={index} name="lineItemNumber" contentPosition="text-center">
                      <FieldEntry name={`InvoiceLines.${index}.itemNumber`} decimals={0} type="number" label="#" inline />
                    </SimpleTD>
                    {getValues().state !== "draft" && (
                      <SimpleTD colIdx={index} name="lineDefaultCode">
                        <FieldEntry inline name={`InvoiceLines.${index}.defaultCode`} readonly />
                      </SimpleTD>
                    )}
                    <SimpleTD colIdx={index} name="lineProductId">
                      {getValues().state === "draft" ? (
                        <FieldRelation
                          inline
                          model="productTemplate"
                          name={`InvoiceLines.${index}.productId`}
                          domain={[["active", "=", true]]}
                          searchColumns={[
                            { field: "defaultCode", label: "Referencia" },
                            { field: "description", label: "Nombre" },
                            { field: "active", label: "Activo", type: "boolean" },
                          ]}
                          readonly={getValues().state !== "draft"}
                          ponChange={(value) =>
                            onchangeProduct({
                              value,
                              line: index,
                            })
                          }
                        />
                      ) : (
                        <FieldEntry inline name={`InvoiceLines.${index}.description`} as="textarea" readonly />
                      )}
                      <FieldEntry inline name={`InvoiceLines.${index}.defaultCode`} readonly invisible />
                    </SimpleTD>
                    <SimpleTD colIdx={index} name="lineQuantity">
                      <FieldEntry
                        inline
                        name={`InvoiceLines.${index}.quantity`}
                        type="number"
                        decimals={3}
                        readonly={getValues().state !== "draft"}
                        onChange={(value) => onchangeQuantity({ value: Number(value), line: index })}
                      />
                    </SimpleTD>
                    <SimpleTD colIdx={index} name="lineUomId">
                      <FieldRelation inline model="uomCategory" name={`InvoiceLines.${index}.uomId`} readonly />
                    </SimpleTD>
                    <SimpleTD colIdx={index} name="linePriceUnit">
                      <FieldEntry
                        inline
                        name={`InvoiceLines.${index}.priceUnit`}
                        type="number"
                        decimals={2}
                        readonly={getValues().state !== "draft"}
                        onChange={() => onchangePriceUnit({ line: index })}
                      />
                    </SimpleTD>
                    <SimpleTD colIdx={index} name="lineAmountUntaxed">
                      <FieldEntry inline name={`InvoiceLines.${index}.amountUntaxed`} type="number" decimals={2} readonly />
                    </SimpleTD>
                    <SimpleTD colIdx={index} name="lineAmountUntax">
                      <FieldEntry inline name={`InvoiceLines.${index}.taxRate`} type="number" decimals={2} readonly invisible />
                      <FieldEntry inline name={`InvoiceLines.${index}.amountTax`} type="number" decimals={2} readonly />
                    </SimpleTD>
                    <SimpleTD colIdx={index} name="lineAmountTotal">
                      <FieldEntry inline name={`InvoiceLines.${index}.amountTotal`} type="number" decimals={2} readonly />
                    </SimpleTD>
                    <SimpleTD contentPosition="text-center" name="lineDelete" colIdx={index}>
                      <BtnDeleteLine action={() => remove(index)} disabled={getValues().state !== "draft"} />
                    </SimpleTD>
                  </tr>
                )}
                action={() => {
                  if (getValues().state !== "draft") return;
                  return append(invoiceMoveLineSchemaDefault);
                }}
              />
              <div className="text-end pe-2">
                <p className="m-1">
                  <strong>Subtotal: </strong>
                  <span>{formatCurrency({ value: totals.subtotal })}</span>
                </p>
                <p className="m-1">
                  <strong>Impuestos: </strong>
                  <span>{formatCurrency({ value: totals.taxes })}</span>
                </p>
                <p className="fs-5 m-1">
                  <strong>Total: </strong>
                  <span className="fw-semibold">{formatCurrency({ value: totals.total })}</span>
                </p>
              </div>
            </Col>
          </PageSheet>
        </Page>
        <Page eventKey="otherInfo" title="Otra información">
          <PageSheet name="otherInfo">
            <FormViewGroup>
              <FieldEntry name="uuidcfdi" label="Folio fiscal" readonly />
            </FormViewGroup>
          </PageSheet>
        </Page>
      </Notebook>
    </FormView>
  );
}

export default InvoiginMoveFormView;

// grossAmount = quantity * priceUnit;

// discountAmount = grossAmount * (discountPercent / 100);

// amountUntaxed = grossAmount - discountAmount;

// amountTax = amountUntaxed * taxRate;

// amountTotal = amountUntaxed + amountTax;
