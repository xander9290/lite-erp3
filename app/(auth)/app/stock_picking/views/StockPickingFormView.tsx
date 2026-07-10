"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { actionStockPicking, StockPickingWithProps } from "../actions/stockPicking.action";
import { stockPickingSchema, stockPickingSchemaDefault, StockPickingSchemaType } from "../schemas/stockPicking.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useModals } from "@/contexts/ModalContext";
import { toDateOnly, toDateTimeLocal, todayDate } from "@/app/libs/validatorDate";
import { FormView, FormViewGroup, FormViewStack } from "@/components/templates/FormView";
import { FieldEntry, FieldRelation } from "@/components/templates/fields";
import { useAuth } from "@/hooks/sessionStore";
import { Notebook, Page, PageSheet } from "@/components/templates/Notebook";
import toast from "react-hot-toast";

function StockPickingFormView({ id, picking }: { id: string | null; picking: StockPickingWithProps | null }) {
  const { companyId } = useAuth();

  const methods = useForm<StockPickingSchemaType>({
    resolver: zodResolver(stockPickingSchema),
    defaultValues: stockPickingSchemaDefault,
  });

  const {
    reset,
    getValues,
    setValue,
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const originalValuesRef = useRef<StockPickingSchemaType | null>(null);
  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };
  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<StockPickingSchemaType> = async (data) => {
    console.log(data);
    const res = await actionStockPicking({ data });
    if (!res.success) return modalError(res.message);

    if (id && id === "null") {
      router.replace(`/app/stock_picking?view_type=form&id=${res.data?.id}`);
      toast.success(res.message);
    } else {
      router.refresh();
      toast.success(res.message);
    }
  };

  useEffect(() => {
    if (!picking) {
      reset(stockPickingSchemaDefault);
      originalValuesRef.current = stockPickingSchemaDefault;
      return;
    }

    const values: StockPickingSchemaType = {
      confirmedDate: toDateTimeLocal(picking.confirmedDate),
      date: toDateOnly(picking.date),
      datePlanned: toDateOnly(picking.datePlanned),
      doneDate: toDateTimeLocal(picking.doneDate),
      name: picking.name,
      operationType: picking.operationType,
      operatorId: {
        id: picking.Operator?.id,
        name: picking.Operator?.name,
      },
      partnerId: {
        id: picking.Partner.id,
        name: picking.Partner.name,
      },
      purchaseId: {
        id: picking.PurchaseOrder?.id,
        name: picking.PurchaseOrder?.name,
      },
      readyDate: toDateTimeLocal(picking.readyDate),
      reference: picking.reference,
      saleId: {
        id: picking.SaleOrder?.id,
        name: picking.SaleOrder?.name,
      },
      state: picking.state,
      whDestId: {
        id: picking.WarehouseDest.id,
        name: picking.WarehouseDest.description,
      },
      whId: {
        id: picking.Warehouse.id,
        name: picking.Warehouse.description,
      },
    };
    reset(values);
    originalValuesRef.current = values;
  }, [picking, reset]);

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  return (
    <FormView
      auditLog="stockPicking"
      reverse={handleReverse}
      onSubmit={onSubmit}
      id={id}
      cleanUrl="/app/stock_picking?view_type=form&id=null"
      methods={methods}
      formStates={[
        {
          name: "draft",
          label: "Borrador",
          decoration: "secondary",
        },
        {
          name: "confirmed",
          label: "Confirmado",
          decoration: "primary",
        },
        {
          name: "ready",
          label: "Listo",
          decoration: "info",
        },
        {
          name: "done",
          label: "Hecho",
          decoration: "success",
        },
        {
          name: "cancel",
          label: "Cancelado",
          decoration: "danger",
        },
      ]}
      state={getValues().state}
    >
      <FormViewGroup>
        <FieldRelation model="partner" name="partnerId" label="Contacto" />
        <FormViewStack>
          <FieldRelation
            model="warehouse"
            name="whDestId"
            label="Destino"
            domain={[
              ["companyId", "=", companyId],
              ["type", "in", ["SALES", "PRODUCTION"]],
            ]}
          />
          <FieldRelation
            model="warehouse"
            name="whId"
            label="Origen"
            domain={[
              ["companyId", "!=", companyId],
              ["type", "in", ["SALES", "PRODUCTION"]],
            ]}
          />
        </FormViewStack>
        <FieldEntry name="reference" label="Referencia" />
      </FormViewGroup>
      <FormViewGroup>
        <FormViewStack>
          <FieldEntry name="date" type="date" label="Fecha" readonly />
          <FieldEntry name="datePlanned" type="date" label="Programar entrega" min={todayDate()} />
        </FormViewStack>
        <FieldRelation model="partner" name="operatorId" label="Operador" domain={[["Tags.name", "some", "WAREHOUSE"]]} />
      </FormViewGroup>
      <Notebook defaultActiveKey="pickingLine">
        <Page eventKey="pickingLine" title="Movimientos">
          <h3>Movimientos</h3>
        </Page>
        <Page eventKey="otherInfo" title="Otra información">
          <PageSheet name="otherInfo">
            <FormViewGroup>
              <FieldEntry name="operationType" label="Tipo de operación" readonly />
              <FieldRelation name="purchaseId" label="Orden de compra" model="purchaseOrder" readonly />
              <FieldRelation name="saleId" label="Orden de venta" model="saleOrder" readonly />
            </FormViewGroup>
          </PageSheet>
        </Page>
      </Notebook>
    </FormView>
  );
}

export default StockPickingFormView;
