"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saleOrderSchema, saleOrderSchemaDefault, SaleOrderSchemaType } from "../schemas/saleOrder.schema";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useModals } from "@/contexts/ModalContext";
import { actionSaleOrder, SaleOrderWithProps } from "../actions/saleOrder.action";
import { FormView, FormViewGroup } from "@/components/templates/FormView";
import { FieldEntry, FieldRelation } from "@/components/templates/fields";
import { Notebook, Page, PageSheet } from "@/components/templates/Notebook";
import { useAuth } from "@/hooks/sessionStore";
import { getCompanyById } from "../../companies/actions/companies-actions";
import { toast } from "react-hot-toast";
import { Partner } from "@/generated/prisma/browser";
import { getIPaymentTermById } from "../../invoicing_settings/payment_term/actions/ipaymentTerm.action";

function SaleOrderViewForm({ saleOrder, id }: { saleOrder: SaleOrderWithProps | null; id: string | null }) {
  const { companyId } = useAuth();

  const methods = useForm<SaleOrderSchemaType>({
    resolver: zodResolver(saleOrderSchema),
    defaultValues: saleOrderSchemaDefault,
  });

  const { reset, getValues, setValue, handleSubmit } = methods;

  const originalValuesRef = useRef<SaleOrderSchemaType | null>(null);
  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };
  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<SaleOrderSchemaType> = async (data) => {
    if (companyId === null) {
      return modalError("Selecciona una comapañía para continuar");
    }

    const res = await actionSaleOrder({ data });
    if (!res.success) return modalError(res.message);
    if (id && id === "null") {
      router.replace(`/app/sale_order?view_type=form&id=${res.data?.id}`);
    } else {
      router.refresh();
    }
    toast.success(res.message);
  };

  useEffect(() => {
    if (!saleOrder) {
      reset(saleOrderSchemaDefault);
      originalValuesRef.current = saleOrderSchemaDefault;
      return;
    }

    const value: SaleOrderSchemaType = {
      name: saleOrder.name,
      confirmedDate: saleOrder.confirmedDate,
      purchaseRef: saleOrder.purchaseRef,
      obs: saleOrder.obs,
      orderDate: saleOrder.orderDate,
      reference: saleOrder.reference,
      state: saleOrder.state,
      companyId: {
        id: saleOrder.Company.id,
        name: saleOrder.Company.name,
      },
      partnerId: {
        id: saleOrder.Partner.id,
        name: saleOrder.Partner.name,
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
    };
    reset(value);
    originalValuesRef.current = value;
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

  const onChangePartner = async (vale: string | null, record: Partner) => {
    const paymentTermId = await getIPaymentTermById({ id: record.paymentTermId });
    if (paymentTermId) {
      setValue("paymentTermId", { id: paymentTermId.id, name: paymentTermId.name });
    }
  };

  const actionConfirm = handleSubmit(async () => {
    const newData: SaleOrderSchemaType = {
      ...getValues(),
      state: "sale",
      confirmedDate: new Date(),
    };
    await onSubmit(newData);
  });

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
          invisible: getValues().state !== "draft",
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
        />
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
        <FieldRelation model="SaleShippingWay" name="shippingWayId" label="Forma de envío" domain={[["active", "=", true]]} readonly={getValues().state !== "draft"} />
      </FormViewGroup>
      <FormViewGroup>
        <FieldRelation
          model="partner"
          name="partnerShippingId"
          label="Dirección de entrega"
          domain={[
            ["displayType", "=", "DELIVERY"],
            ["parentId", "=", getValues().partnerId?.id],
          ]}
          readonly={getValues().state !== "draft"}
        />
        <FieldEntry name="orderDate" label="Fecha de la orden" type="date" readonly />
        <FieldRelation name="paymentTermId" label="Término de pago" model="invoicingPaymentTerm" readonly={getValues().state !== "draft"} />
      </FormViewGroup>
      <Notebook defaultActiveKey="saleOrderLines">
        <Page eventKey="saleOrderLines" title="Líneas de la orden">
          <PageSheet name="saleOrderLines">
            <h3>Líneas de la orden</h3>
          </PageSheet>
        </Page>
        <Page title="Otra información" eventKey="otherInfo">
          <PageSheet name="otherInfoPage">
            <FormViewGroup>
              <FieldRelation
                model="warehouse"
                name="warehouseId"
                label="Almacén"
                domain={[
                  ["type", "=", "SALES"],
                  ["companyId", "=", companyId],
                ]}
                readonly={getValues().state !== "draft"}
              />
              <FieldRelation model="company" name="companyId" label="Empresa" readonly />
            </FormViewGroup>
            <FormViewGroup>
              <FieldEntry name="reference" label="Referencia" />
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
