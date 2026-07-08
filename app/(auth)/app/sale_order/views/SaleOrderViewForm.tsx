"use client";

import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saleOrderLineSchemaDefault, saleOrderSchema, saleOrderSchemaDefault, SaleOrderSchemaType } from "../schemas/saleOrder.schema";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useModals } from "@/contexts/ModalContext";
import { actionSaleCancel, actionSaleConfirm, actionSaleOrder, SaleOrderWithProps } from "../actions/saleOrder.action";
import { FormView, FormViewGroup, FormViewStack } from "@/components/templates/FormView";
import { FieldEntry, FieldRelation, FieldSelect, FieldText } from "@/components/templates/fields";
import { Notebook, Page, PageSheet } from "@/components/templates/Notebook";
import { useAuth } from "@/hooks/sessionStore";
import { getCompanyById } from "../../companies/actions/companies-actions";
import { Partner, ProductPricelistItem } from "@/generated/prisma/browser";
import { getIPaymentTermById } from "../../invoicing_settings/payment_term/actions/ipaymentTerm.action";
import { Col } from "react-bootstrap";
import { BtnDeleteLine, SimpleTable, SimpleTD } from "@/components/templates/simpletemplates";
import { getProductById } from "../../product_template/products/actions/productTemplate.action";
import { formatCurrency } from "@/app/libs/helpers";
import { toDateOnly } from "@/app/libs/validatorDate";
import { getPartnerById } from "../../partners/actions/partner-actions";

function SaleOrderViewForm({ saleOrder, id }: { saleOrder: SaleOrderWithProps | null; id: string | null }) {
  const { companyId } = useAuth();

  const methods = useForm<SaleOrderSchemaType>({
    resolver: zodResolver(saleOrderSchema),
    defaultValues: saleOrderSchemaDefault,
  });

  const { reset, getValues, setValue, handleSubmit, control } = methods;

  const {
    remove,
    append,
    fields: lines,
  } = useFieldArray({
    control,
    name: "SaleOrderLines",
  });

  const originalValuesRef = useRef<SaleOrderSchemaType | null>(null);
  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };
  const router = useRouter();

  const { modalError, modalConfirm } = useModals();

  const [totals, setTotals] = useState({
    subtotal: 0.0,
    taxes: 0.0,
    total: 0.0,
  });

  const [partnerLocation, setPartnerLocation] = useState<string | null>("");

  const save = async (data: SaleOrderSchemaType): Promise<SaleOrderWithProps | null> => {
    const res = await actionSaleOrder({ data });
    if (!res.success) {
      modalError(res.message);
      return null;
    }
    if (id && id === "null") {
      router.replace(`/app/sale_order?view_type=form&id=${res.data?.id}`);
      return res.data ?? null;
    } else {
      router.refresh();
      return res.data ?? null;
    }
  };

  const onSubmit: SubmitHandler<SaleOrderSchemaType> = async (data) => {
    return await save(data);
  };

  const computeTotals = () => {
    const { SaleOrderLines } = getValues();
    let subtotal = 0.0;
    let taxes = 0.0;
    let total = 0.0;
    for (const line of SaleOrderLines) {
      subtotal += line.subtotal;
      taxes += line.taxAmount;
      total += line.total;
    }
    setTotals({ subtotal, taxes, total });
  };

  useEffect(() => {
    if (!saleOrder) {
      reset(saleOrderSchemaDefault);
      originalValuesRef.current = saleOrderSchemaDefault;
      return;
    }

    const value: SaleOrderSchemaType = {
      name: saleOrder.name,
      confirmedDate: saleOrder.confirmedDate?.toISOString() || "",
      purchaseRef: saleOrder.purchaseRef,
      obs: saleOrder.obs,
      orderDate: toDateOnly(saleOrder.orderDate),
      reference: saleOrder.reference,
      state: saleOrder.state,
      companyId: {
        id: saleOrder.Company.id,
        name: saleOrder.Company.name,
      },
      partnerId: {
        id: saleOrder.Partner.id,
        name: saleOrder.Partner.name,
        pricelist: saleOrder.Partner.productPricelist,
      },
      saleUserId: {
        id: saleOrder.SaleUser.id,
        name: saleOrder.SaleUser.name,
      },
      partnerShippingId: {
        id: saleOrder.PartnerShipping?.id,
        name: saleOrder.PartnerShipping?.name,
      },
      shippingWayId: {
        id: saleOrder.ShippingWay.id,
        name: saleOrder.ShippingWay.name,
      },
      warehouseId: {
        id: saleOrder.Warehouse.id,
        name: saleOrder.Warehouse.name,
      },
      paymentTermId: {
        id: saleOrder.PaymentTerm.id,
        name: saleOrder.PaymentTerm.name,
      },
      SaleOrderLines: saleOrder.SaleOrderLines.map((line) => ({
        id: line.id,
        productId: {
          id: line.Product.id,
          name: line.Product.name,
        },
        quantity: line.quantity,
        uomId: {
          id: line.Uom.id,
          name: line.Uom.code,
        },
        pricelist: line.pricelist,
        priceUnit: line.priceUnit,
        orderId: {
          id: saleOrder.id,
          name: saleOrder.name,
        },
        subtotal: line.subtotal,
        taxAmount: line.taxAmount,
        taxRate: line.taxRate,
        total: line.total,
      })),
    };
    reset(value);
    originalValuesRef.current = value;
    computeTotals();
    onChangePartnerShipping(saleOrder.partnerShippingId);
  }, [saleOrder, reset]);

  useEffect(() => {
    if (id && id !== "null") return;
    const setSaleWarehouse = async () => {
      const getCompany = await getCompanyById({ id: companyId });
      if (getCompany) {
        const getSalesWh = getCompany.Warehouses.filter((wh) => wh.type === "SALES");

        setValue("companyId", { id: getCompany.id, name: getCompany.name });

        // si hay menos de un almacén de ventas definido, por default se coloca el único
        if (getSalesWh.length === 1) {
          setValue("warehouseId", {
            id: getSalesWh[0].id,
            name: getSalesWh[0].name,
          });
        }
      }
    };
    setSaleWarehouse();
  }, [companyId, id]);

  useEffect(() => {
    computeTotals();
  }, [lines]);

  const onChangePartner = async (vale: string | null, record: Partner) => {
    if (getValues().partnerId.id && getValues().SaleOrderLines.length >= 1) {
      return modalError("No es posible cambiar de cliente mientras la cotización tenga líneas ya definidas");
    }
    const paymentTermId = await getIPaymentTermById({
      id: record.paymentTermId,
    });
    if (paymentTermId) {
      setValue("paymentTermId", {
        id: paymentTermId.id,
        name: paymentTermId.name,
      });
    }
    setValue("partnerId.pricelist", record.productPricelist);
  };

  const onChangePartnerShipping = async (value: string | null) => {
    if (!value) {
      setPartnerLocation("");
      return null;
    }
    const shippingId = await getPartnerById({ id: value });
    if (shippingId) {
      setPartnerLocation(shippingId.completeAddress);
    } else {
      setPartnerLocation("");
    }
  };

  const actionConfirm = handleSubmit(async () => {
    const newData: SaleOrderSchemaType = {
      ...getValues(),
      state: "sale",
      confirmedDate: new Date().toISOString(),
    };

    if (getValues().SaleOrderLines.length < 1) {
      modalError("La orden no tiene líneas");
      return null;
    }
    const res = await actionSaleConfirm({ data: newData });

    if (!res.success) return modalError(res.message);

    await onSubmit(newData);
  });

  const actionCancel = handleSubmit(async () => {
    const newData: SaleOrderSchemaType = {
      ...getValues(),
      state: "cancel",
    };
    const res = await actionSaleCancel({ data: newData });
    if (!res.success) return modalError(res.message);

    await onSubmit(newData);
  });

  const handleActionCancel = () => {
    modalConfirm("Confirma que quieres cancelar la orden", () => actionCancel());
  };

  const onChangeProduct = async ({ value, line }: { value: string | null; line: number }) => {
    const productId = await getProductById({ id: value });
    if (productId) {
      const partnerPricelist = !getValues().partnerId.pricelist ? productId["price1"] : productId[getValues().partnerId.pricelist ?? "price1"];

      const pricelist = partnerPricelist;
      const taxRate = productId.TaxSale?.amount ?? 0.0;
      const allowOutQty = productId.uomOutgoingAllowed;

      const subtotal = allowOutQty * pricelist; // ✅ base gravable (sin IVA)
      const total = subtotal * (1 + taxRate); // ✅ total con IVA incluido
      const taxAmount = subtotal * taxRate; // opcional: monto del impuesto

      setValue(`SaleOrderLines.${line}.quantity`, allowOutQty);
      setValue(`SaleOrderLines.${line}.uomId`, {
        id: productId.Uom?.id || "",
        name: productId.Uom?.code || "",
      });

      setValue(`SaleOrderLines.${line}.pricelist`, getValues().partnerId.pricelist || "price1");
      setValue(`SaleOrderLines.${line}.priceUnit`, pricelist);
      setValue(`SaleOrderLines.${line}.taxRate`, taxRate);
      setValue(`SaleOrderLines.${line}.taxAmount`, taxAmount);
      setValue(`SaleOrderLines.${line}.subtotal`, subtotal);
      setValue(`SaleOrderLines.${line}.total`, total);
    }

    computeTotals();
  };

  const onChangeQuantity = ({ value, line }: { line: number; value: number }) => {
    const priceUnit = getValues().SaleOrderLines[line].priceUnit; // ✅ ya viene sin IVA
    const taxRate = getValues().SaleOrderLines[line].taxRate ?? 0.0;
    const qty = value;

    const subtotal = qty * priceUnit; // ✅ base gravable (sin IVA)
    const total = subtotal * (1 + taxRate); // ✅ total con IVA incluido
    const taxAmount = subtotal * taxRate;

    setValue(`SaleOrderLines.${line}.taxAmount`, taxAmount);
    setValue(`SaleOrderLines.${line}.subtotal`, subtotal);
    setValue(`SaleOrderLines.${line}.total`, total);

    computeTotals();
  };

  const onChangePricelist = async ({ value, line }: { value: ProductPricelistItem; line: number }) => {
    if (!value) {
      setValue(`SaleOrderLines.${line}.pricelist`, "price1");
      return;
    }
    const productLineId = getValues().SaleOrderLines[line].productId.id;
    const productId = await getProductById({ id: productLineId });
    if (productId) {
      const pricelist = productId[value];

      const currentQty = getValues().SaleOrderLines[line].quantity;

      setValue(`SaleOrderLines.${line}.priceUnit`, pricelist);
      onChangeQuantity({ value: currentQty, line });

      computeTotals();
    }
  };

  const onChangePriceUnit = ({ line }: { line: number }) => {
    const qty = getValues().SaleOrderLines[line].quantity;
    onChangeQuantity({ value: qty, line });
  };

  return (
    <FormView
      methods={methods}
      cleanUrl="/app/sale_order?view_type=form&id=null"
      id={id}
      onSubmit={onSubmit}
      reverse={handleReverse}
      auditLog="saleOrder"
      formStates={[
        { name: "draft", label: "Cotización", decoration: "secondary" },
        { name: "sale", label: "Venta", decoration: "info" },
        { name: "done", label: "Terminado", decoration: "success" },
        { name: "cancel", label: "Cancelado", decoration: "danger" },
      ]}
      state={getValues().state}
      actions={[
        {
          action: actionConfirm,
          fieldName: "actionConfirm",
          string: "Confirmar",
          invisible: getValues().state !== "draft" || id === "null",
        },
        {
          action: handleActionCancel,
          fieldName: "actionCancel",
          string: "Cancelar",
          variant: "danger",
          invisible: getValues().state !== "sale",
        },
      ]}
    >
      <FormViewGroup>
        <FieldRelation
          ponChange={(value, record) => onChangePartner(value, record as Partner)}
          model="partner"
          name="partnerId"
          label="Cliente"
          domain={[["displayType", "=", "CUSTOMER"]]}
          readonly={getValues().state !== "draft"}
          searchColumns={[
            { field: "name", label: "Nombre" },
            { field: "phone", label: "Teléfono" },
          ]}
        />
        <FormViewStack>
          <FieldRelation
            model="user"
            name="saleUserId"
            label="Vendedor"
            domain={[
              ["active", "=", true],
              ["Partner.Tags.name", "some", "SALE"],
            ]}
            readonly={getValues().state !== "draft"}
          />
          <FieldRelation
            model="warehouse"
            name="warehouseId"
            label="Almacén"
            domain={[
              ["type", "=", "SALES"],
              ["companyId", "=", companyId],
            ]}
            readonly
          />
        </FormViewStack>
        <FormViewStack>
          <FieldRelation model="SaleShippingWay" name="shippingWayId" label="Forma de envío" domain={[["active", "=", true]]} readonly={getValues().state !== "draft"} />
          <FieldRelation name="paymentTermId" label="Término de pago" model="invoicingPaymentTerm" readonly={getValues().state !== "draft"} />
        </FormViewStack>
      </FormViewGroup>
      <FormViewGroup>
        <FieldRelation
          model="partner"
          name="partnerShippingId"
          label="Locación de entrega"
          domain={[
            ["displayType", "=", "DELIVERY"],
            ["parentId", "=", getValues().partnerId?.id],
          ]}
          readonly={getValues().state !== "draft"}
          ponChange={(value) => onChangePartnerShipping(value)}
        />
        <div
          className="my-1 px-1 bg-body-tertiary text-center rounded border"
          style={{
            height: "25px",
          }}
        >
          <FieldText name="shippingText" output={partnerLocation} />
        </div>
        <FormViewStack>
          <FieldEntry name="orderDate" label="Fecha de la orden" type="date" readonly />
          {getValues().state !== "draft" && <FieldEntry name="confirmedDate" label="Confirmado" type="datetime-local" readonly />}
        </FormViewStack>
        <FieldEntry name="reference" label="Referencia" readonly={getValues().state !== "draft"} />
      </FormViewGroup>
      <Notebook defaultActiveKey="saleOrderLines">
        <Page eventKey="saleOrderLines" title="Líneas de la orden">
          <PageSheet name="saleOrderLines">
            <Col md="12" className="p-0 m-0 overflow-auto">
              <SimpleTable
                data={lines}
                resizable
                headers={[
                  {
                    string: "Producto",
                    name: "productId",
                    width: 270,
                    minWidth: 170,
                  },
                  {
                    string: "Cantidad",
                    name: "quantity",
                    width: 30,
                    minWidth: 30,
                  },
                  { string: "UdM", name: "uomId", width: 35, minWidth: 20 },
                  {
                    string: "Lista",
                    name: "pricelist",
                    width: 80,
                    minWidth: 50,
                  },
                  {
                    string: "Precio U.",
                    name: "priceUnit",
                    width: 30,
                    minWidth: 30,
                  },
                  {
                    string: "Subtotal",
                    name: "subtotal",
                    width: 50,
                    minWidth: 50,
                  },
                  { string: "IVA", name: "taxRate", width: 30, minWidth: 30 },
                  { string: "Total", name: "total", width: 50, minWidth: 50 },
                  {
                    string: <i className="bi bi-trash"></i>,
                    className: "text-center",
                    width: 25,
                    minWidth: 25,
                    name: "lineDelete",
                  },
                ]}
                renderRow={(row, index) => {
                  return (
                    <tr key={row.id}>
                      <SimpleTD colIdx={index} name="lineProductId">
                        <FieldRelation
                          name={`SaleOrderLines.${index}.productId`}
                          model="productTemplate"
                          inline
                          domain={[
                            ["displayType", "in", ["PRODUCT", "BOM"]],
                            ["sales", "=", true],
                          ]}
                          searchColumns={[
                            { field: "name", label: "Nombre" },
                            {
                              field: "sales",
                              label: "Compra",
                              type: "boolean",
                            },
                          ]}
                          readonly={getValues().state !== "draft"}
                          ponChange={(value) => {
                            onChangeProduct({
                              line: index,
                              value,
                            });
                          }}
                        />
                      </SimpleTD>
                      <SimpleTD colIdx={index} name="lineQuantity">
                        <FieldEntry
                          inline
                          name={`SaleOrderLines.${index}.quantity`}
                          type="number"
                          decimals={3}
                          readonly={getValues().state !== "draft"}
                          onChange={(value) =>
                            onChangeQuantity({
                              line: index,
                              value: Number(value),
                            })
                          }
                        />
                      </SimpleTD>
                      <SimpleTD colIdx={index} name="lineUomId">
                        <FieldRelation inline model="uomCategory" name={`SaleOrderLines.${index}.uomId`} readonly />
                      </SimpleTD>
                      <SimpleTD colIdx={index} name="linePricelist">
                        <FieldSelect
                          inline
                          options={[
                            { label: "Precio 1", value: "price1" },
                            { label: "Precio 2", value: "price2" },
                            { label: "Precio 3", value: "price3" },
                            { label: "Precio 4", value: "price4" },
                            { label: "Precio 5", value: "price5" },
                          ]}
                          name={`SaleOrderLines.${index}.pricelist`}
                          onChange={(value) =>
                            onChangePricelist({
                              line: index,
                              value: value as ProductPricelistItem,
                            })
                          }
                          readonly={getValues().state !== "draft"}
                        />
                      </SimpleTD>
                      <SimpleTD colIdx={index} name="linePriceUnit">
                        <FieldEntry
                          inline
                          name={`SaleOrderLines.${index}.priceUnit`}
                          type="number"
                          decimals={2}
                          readonly={getValues().state !== "draft"}
                          onChange={() => onChangePriceUnit({ line: index })}
                        />
                      </SimpleTD>
                      <SimpleTD colIdx={index} name="lineSubtotal">
                        <FieldEntry inline name={`SaleOrderLines.${index}.subtotal`} type="number" decimals={2} readonly />
                      </SimpleTD>
                      <SimpleTD colIdx={index} name="lineTaxRate">
                        <FieldEntry inline name={`SaleOrderLines.${index}.taxRate`} type="number" decimals={2} readonly invisible />
                        <FieldEntry inline name={`SaleOrderLines.${index}.taxAmount`} type="number" decimals={2} readonly />
                      </SimpleTD>
                      <SimpleTD colIdx={index} name="lineTotal">
                        <FieldEntry inline name={`SaleOrderLines.${index}.total`} type="number" decimals={2} readonly />
                      </SimpleTD>
                      <SimpleTD contentPosition="text-center" name="lineDelete" colIdx={index}>
                        <BtnDeleteLine action={() => remove(index)} disabled={getValues().state !== "draft"} />
                      </SimpleTD>
                    </tr>
                  );
                }}
                action={() => {
                  if (getValues().state !== "draft") return;
                  return append(saleOrderLineSchemaDefault);
                }}
              />
              <div className="text-end pe-2">
                <p className="m-1">
                  <strong>Subtotal: </strong>
                  <span>{formatCurrency({ value: totals.subtotal })}</span>
                </p>
                <p className="m-1">
                  <strong>IVA: </strong>
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
        <Page title="Otra información" eventKey="otherInfo">
          <PageSheet name="otherInfoPage">
            <FormViewGroup>
              <FieldRelation model="company" name="companyId" label="Empresa" readonly />
            </FormViewGroup>
            <FormViewGroup>
              <FieldEntry name="purchaseRef" label="Orden de compra" />
              <FieldEntry name="obs" label="Observaciones de entrega" as="textarea" />
            </FormViewGroup>
          </PageSheet>
        </Page>
      </Notebook>
    </FormView>
  );
}

export default SaleOrderViewForm;
