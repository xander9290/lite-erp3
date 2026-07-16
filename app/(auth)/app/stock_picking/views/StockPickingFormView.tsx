"use client";

import { SubmitHandler, useForm, useFieldArray } from "react-hook-form";
import { actionStockPicking, actionStockPickingCancel, actionStockPickingConfirm, actionStockPickingDone, actionStockPickingReady, StockPickingWithProps } from "../actions/stockPicking.action";
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
import { Alert, Col } from "react-bootstrap";
import { BtnDeleteLine, SimpleTable, SimpleTD } from "@/components/templates/simpletemplates";
import { stockPickingLineDefautl } from "../schemas/stockPickingLine.schema";
import { getProductById } from "../../product_template/products/actions/productTemplate.action";
import { round } from "@/app/libs/helpers";

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

  const {
    remove,
    append,
    fields: lines,
  } = useFieldArray({
    control,
    name: "PickingLine",
  });

  const originalValuesRef = useRef<StockPickingSchemaType | null>(null);
  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };
  const router = useRouter();

  const { modalError, modalConfirm } = useModals();

  const hasOrigins = getValues().purchaseId !== null || getValues().saleId !== null;

  const onSubmit: SubmitHandler<StockPickingSchemaType> = async (data) => {
    for (const line of data.PickingLine) {
      if (line.delivered > line.quantity) {
        modalError(`La cantidad entregada del product ${line.productId.name} no debe ser mayor a la demandada`);
        return;
      }
    }

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

  const actionConfirmed = handleSubmit(async () => {
    const lines = getValues().PickingLine;
    if (lines.length < 1) return modalError("No hay líneas en la orden");

    const newData: StockPickingSchemaType = {
      ...getValues(),
      state: "confirmed",
      confirmedDate: new Date().toISOString(),
    };

    const res = await actionStockPickingConfirm({ data: newData });
    if (!res.success) return modalError(res.message);
    router.refresh();
  });

  const actionReady = handleSubmit(async () => {
    const newData: StockPickingSchemaType = {
      ...getValues(),
      state: "ready",
      readyDate: new Date().toISOString(),
    };
    const res = await actionStockPickingReady({ data: newData });
    if (!res.success) return modalError(res.message);
    router.refresh();
  });

  const actionDone = handleSubmit(async () => {
    const newData: StockPickingSchemaType = {
      ...getValues(),
      state: "done",
      doneDate: new Date().toISOString(),
    };
    const res = await actionStockPickingDone({ data: newData });
    if (!res.success) return modalError(res.message);
    router.refresh();
  });

  const actionCancel = handleSubmit(async () => {
    if (hasOrigins) {
      return modalError("No es posible cancelar el documento en este momento");
    }

    const newData: StockPickingSchemaType = {
      ...getValues(),
      state: "cancel",
      cancelDate: new Date().toISOString(),
    };
    const res = await actionStockPickingCancel({ data: { ...newData, id } });
    if (!res.success) return modalError(res.message);
    router.refresh();
  });

  const onChangeProduct = async (value: string | null, line: number) => {
    const productId = await getProductById({ id: value });
    if (productId) {
      const whId = getValues().whId;
      let qtyAvailable = 0.0;
      const stocks = productId.Stocks.filter((wh) => wh.Warehouse.id === whId.id)[0];
      qtyAvailable = round(stocks.qty - stocks.reservedQty, 3);
      setValue(`PickingLine.${line}.qtyAvailable`, qtyAvailable);
      setValue(`PickingLine.${line}.uomId`, {
        id: productId.Uom?.id || "",
        name: productId.Uom?.code || "",
      });
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
      companyId: picking.companyId,
      companyOriginId: picking.companyOriginId,
      date: toDateOnly(picking.date),
      datePlanned: toDateOnly(picking.datePlanned),
      doneDate: toDateTimeLocal(picking.doneDate),
      cancelDate: toDateTimeLocal(picking.cancelDate),
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
      PickingLine: picking.PickingLine.map((line) => ({
        delivered: line.delivered,
        qtyAvailable: 0.0,
        quantity: line.quantity,
        productId: { id: line.Product.id, name: line.Product.name },
        uomId: { id: line.Uom.id, name: line.Uom.code },
        id: line.id,
      })),
    };
    console.log(picking.cancelDate);
    reset(values);
    originalValuesRef.current = values;
  }, [picking, reset]);

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  const handleActionCancel = () => {
    return modalConfirm("Confirma que quieres cancelar el documento", () => actionCancel());
  };

  if (!companyId) {
    return <Alert variant="warning">Elige una empresa para continuar</Alert>;
  }

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
      actions={[
        {
          action: actionConfirmed,
          fieldName: "actionConfirmed",
          string: "Confirmar",
          variant: "info",
          invisible: id === "null" || getValues().state !== "draft",
        },
        {
          action: actionReady,
          fieldName: "actionReady",
          string: "Listo",
          variant: "primary",
          invisible: getValues().state !== "confirmed",
        },
        {
          action: actionDone,
          fieldName: "actionDone",
          string: "Terminar",
          variant: "success",
          invisible: getValues().state !== "ready",
        },
        {
          action: handleActionCancel,
          fieldName: "actionCancel",
          string: "Cancelar",
          variant: "danger",
          invisible: getValues().state === "draft" || getValues().state === "cancel",
        },
      ]}
    >
      <FormViewGroup>
        <FieldRelation model="partner" name="partnerId" label="Contacto" readonly={getValues().state !== "draft"} domain={[["Tags.name", "some", "EMPLOYEE"]]} />
        <FormViewStack>
          <FieldRelation
            model="warehouse"
            name="whId"
            label="Origen"
            domain={[
              ["companyId", "!=", companyId],
              ["type", "in", ["SALES", "PRODUCTION"]],
            ]}
            readonly={getValues().state !== "draft"}
          />
          <FieldRelation
            model="warehouse"
            name="whDestId"
            label="Destino"
            domain={[
              ["companyId", "=", companyId],
              ["type", "in", ["SALES", "PRODUCTION"]],
            ]}
            readonly={getValues().state !== "draft"}
          />
        </FormViewStack>
        <FieldEntry name="reference" label="Referencia" />
      </FormViewGroup>
      <FormViewGroup>
        <FormViewStack>
          <FieldEntry name="date" type="date" label="Fecha" readonly />
          <FieldEntry
            name="datePlanned"
            type="date"
            label="Programar entrega"
            min={todayDate()}
            readonly={getValues().companyId !== companyId || ["done", "cancel"].includes(getValues().state) || hasOrigins}
          />
        </FormViewStack>
        <FieldRelation model="partner" name="operatorId" label="Operador" domain={[["Tags.name", "some", "WAREHOUSE"]]} readonly={getValues().state !== "confirmed"} />
      </FormViewGroup>
      <Notebook defaultActiveKey="pickingLine">
        <Page eventKey="pickingLine" title="Movimientos">
          <Col md="12" className="p-0 m-0 overflow-auto">
            <SimpleTable
              data={lines}
              headers={[
                {
                  string: "Producto",
                  name: "productId",
                  width: 270,
                  minWidth: 170,
                },
                {
                  string: "Disponible",
                  name: "delivered",
                  width: 30,
                  minWidth: 30,
                },
                {
                  string: "Demanda",
                  name: "quantity",
                  width: 30,
                  minWidth: 30,
                },
                {
                  string: "Entregado",
                  name: "delivered",
                  width: 30,
                  minWidth: 30,
                },
                { string: "UdM", name: "uomId", width: 35, minWidth: 20 },
                {
                  string: <i className="bi bi-trash"></i>,
                  className: "text-center",
                  width: 25,
                  minWidth: 25,
                  name: "lineDelete",
                },
              ]}
              resizable
              renderRow={(row, index) => (
                <tr key={row.id}>
                  <SimpleTD colIdx={index} name="lineProductId">
                    <FieldRelation inline model="productTemplate" name={`PickingLine.${index}.productId`} ponChange={(value) => onChangeProduct(value, index)} />
                  </SimpleTD>
                  <SimpleTD colIdx={index} name="lineQtyAvailable">
                    <FieldEntry name={`PickingLine.${index}.qtyAvailable`} type="number" decimals={3} inline />
                  </SimpleTD>
                  <SimpleTD colIdx={index} name="lineQuantity">
                    <FieldEntry inline name={`PickingLine.${index}.quantity`} decimals={3} type="number" readonly={getValues().state !== "draft"} />
                  </SimpleTD>
                  <SimpleTD colIdx={index} name="lineDelivered">
                    <FieldEntry inline name={`PickingLine.${index}.delivered`} decimals={3} type="number" readonly={getValues().state !== "confirmed" || getValues().companyOriginId !== companyId} />
                  </SimpleTD>
                  <SimpleTD colIdx={index} name="lineUomId">
                    <FieldRelation inline model="uomCategory" name={`PickingLine.${index}.uomId`} readonly />
                  </SimpleTD>
                  <SimpleTD colIdx={index} name="lineRemoveLine" contentPosition="text-center">
                    <BtnDeleteLine action={() => remove(index)} disabled={getValues().state !== "draft"} />
                  </SimpleTD>
                </tr>
              )}
              action={() => {
                if (getValues().state !== "draft") return;
                return append(stockPickingLineDefautl);
              }}
            />
          </Col>
        </Page>
        <Page eventKey="otherInfo" title="Otra información">
          <PageSheet name="otherInfo">
            <FormViewGroup>
              <FieldEntry name="operationType" label="Tipo de operación" readonly />
              <FieldRelation name="purchaseId" label="Orden de compra" model="purchaseOrder" readonly />
              <FieldRelation name="saleId" label="Orden de venta" model="saleOrder" readonly />
            </FormViewGroup>
            <FormViewGroup title="Línea de tiempo">
              <FormViewStack>
                <FieldEntry name="confirmedDate" label="Confirmado" type="datetime-local" readonly />
                <FieldEntry name="readyDate" label="Listo" type="datetime-local" readonly />
              </FormViewStack>
              <FormViewStack>
                <FieldEntry name="doneDate" label="Hecho" type="datetime-local" readonly />
                <FieldEntry name="cancelDate" label="Cancelado" type="datetime-local" readonly />
              </FormViewStack>
            </FormViewGroup>
          </PageSheet>
        </Page>
      </Notebook>
    </FormView>
  );
}

export default StockPickingFormView;
