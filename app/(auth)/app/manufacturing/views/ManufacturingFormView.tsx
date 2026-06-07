"use client";

import { createManufacturing, ManufacturingWithProps, updateManufacturing } from "../actions/manufacturing.action";
import { SubmitHandler, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { manufacturingSchema, manufacturingSchemaDefault, ManufacturingSchemaType } from "../schemas/manufacturing.schema";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useModals } from "@/contexts/ModalContext";
import { FormView, FormViewGroup, FormViewStack, TFormState } from "@/components/templates/FormView";
import { FieldEntry, FieldRelation } from "@/components/templates/fields";
import { getUomById } from "../../product_template/uom_category/actions/uom.action";
import { useAuth } from "@/hooks/sessionStore";
import { Notebook, Page, PageSheet } from "@/components/templates/Notebook";
import { Col } from "react-bootstrap";
import { BtnDeleteLine, SimpleTable, SimpleTD } from "@/components/templates/simpletemplates";
import toast from "react-hot-toast";
import type { ManufacturingState, ProductTemplate } from "@/generated/prisma/client";
import { getProductById, ProductTemplateWithProps } from "../../product_template/products/actions/productTemplate.action";

const manufacturingStates: TFormState = [
  {
    name: "draft",
    label: "Borrador",
    decoration: "info",
  },
  {
    name: "in_process",
    label: "Proceso",
    decoration: "info",
  },
  {
    name: "finished",
    label: "Finalizado",
    decoration: "info",
  },
  {
    name: "affected",
    label: "Creado",
    decoration: "info",
  },
  {
    name: "cancel",
    label: "Cancelado",
    decoration: "danger",
  },
];

export const manufacturingStatesDisplay: Record<ManufacturingState, string> = {
  draft: "Borrador",
  in_process: "En proceso",
  finished: "Finalizado",
  affected: "Creado",
  cancel: "Cancelado",
};

let staticYield = 0.0;
let staticIngridients: ProductTemplateWithProps["ReceiptLines"] = [];

function ManufacturingFormView({ id, manufacturing }: { id: string | null; manufacturing: ManufacturingWithProps | null }) {
  const methods = useForm<ManufacturingSchemaType>({
    resolver: zodResolver(manufacturingSchema),
    defaultValues: manufacturingSchemaDefault,
  });
  const { reset, getValues, setValue, control, handleSubmit } = methods;
  const { state: stateValue } = getValues();

  const { remove, fields, append } = useFieldArray({
    control,
    name: "ManufacturingLines",
  });

  const { companyId } = useAuth();

  const router = useRouter();

  const originalValuesRef = useRef<ManufacturingSchemaType | null>(null);

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<ManufacturingSchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createManufacturing({ data });
      if (!res.success) return modalError(res.message);
      router.replace(`/app/manufacturing?view_type=form&id=${res.data?.id}`);
      toast.success(res.message);
    } else {
      const res = await updateManufacturing({ id, data });
      if (!res.success) return modalError(res.message);
      router.refresh();
      toast.success(res.message);
    }
  };

  useEffect(() => {
    if (!manufacturing) {
      reset(manufacturingSchemaDefault);
      originalValuesRef.current = manufacturingSchemaDefault;
      return;
    }

    const values: ManufacturingSchemaType = {
      name: manufacturing.name,
      quantity: manufacturing.quantity,
      yield: manufacturing.yield,
      state: manufacturing.state,
      date: manufacturing?.date,
      productId: {
        id: manufacturing.Product.id,
        name: manufacturing.Product.name,
      },
      uomId: {
        id: manufacturing.Uom.id,
        name: manufacturing.Uom.name,
      },
      whOriginId: {
        id: manufacturing.WhOrigin.id,
        name: manufacturing.WhOrigin.name,
      },
      whDestId: {
        id: manufacturing.WhDest.id,
        name: manufacturing.WhDest.name,
      },
      ManufacturingLines: manufacturing.ManufacturingLines.map((m) => ({
        id: m.id,
        outQty: m.outQty,
        productIngredientId: {
          id: m.Product.id,
          name: m.Product.name,
        },
        uomId: {
          id: m.Uom.id,
          name: m.Uom.name,
        },
      })),
      createdUid: manufacturing.createUid,
      createdAt: manufacturing.createdAt,
      updatedAt: manufacturing.updatedAt,
    };
    reset(values);
    originalValuesRef.current = values;
  }, [reset, manufacturing]);

  const handleChangeProduct = async ({ id, record }: { id: string | null; record: ProductTemplate }) => {
    const uom = await getUomById({ id: record?.uomId || null });
    setValue("uomId", { id: uom?.id || "", name: uom?.name || "" });
    const getProduct = await getProductById({ id });
    if (getProduct) {
      staticIngridients = getProduct.ReceiptLines;
      setValue("quantity", 1);
      staticYield = getProduct.yield;
      setValue("yield", getValues().quantity * staticYield);
      remove();
      for (const receipt of staticIngridients) {
        append({
          outQty: receipt.qty,
          productIngredientId: { id: receipt.Product.id, name: receipt.Product.name },
          uomId: { id: receipt.Uom.id, name: receipt.Uom.name },
        });
      }
    }
  };

  const setUomId = async (record: any, row: number) => {
    const uomId = await getUomById({ id: record.uomId });
    if (!uomId) return { id: "", name: "" };
    setValue(`ManufacturingLines.${row}.uomId`, { id: uomId?.id, name: uomId?.name });
  };

  const computeYield = (value: string) => {
    const qty = Number(value);
    setValue("yield", qty * staticYield);
    remove();
    for (const line of staticIngridients) {
      append({
        outQty: line.qty * qty,
        productIngredientId: { id: line.Product.id, name: line.Product.name },
        uomId: { id: line.Uom.id, name: line.Uom.name },
      });
    }
  };

  const actionInProcess = handleSubmit(async () => {
    const newData: ManufacturingSchemaType = {
      ...getValues(),
      state: "in_process",
    };
    await onSubmit(newData);
  });

  const actionFinish = handleSubmit(async () => {
    const newData: ManufacturingSchemaType = {
      ...getValues(),
      state: "finished",
    };
    await onSubmit(newData);
  });

  const actionAffected = handleSubmit(async () => {
    const newData: ManufacturingSchemaType = {
      ...getValues(),
      state: "affected",
    };
    await onSubmit(newData);
  });

  const actionCancel = handleSubmit(async () => {
    const newData: ManufacturingSchemaType = {
      ...getValues(),
      state: "cancel",
    };
    await onSubmit(newData);
  });

  return (
    <FormView
      formStates={manufacturingStates}
      state={stateValue}
      auditLog="manufacturing"
      reverse={handleReverse}
      onSubmit={onSubmit}
      id={id}
      methods={methods}
      cleanUrl="/app/manufacturing?view_type=form&id=null"
      actions={[
        {
          action: actionInProcess,
          fieldName: "actionInProcess",
          string: "Procesar",
          variant: "info",
          invisible: getValues().state !== "draft",
        },
        {
          action: actionFinish,
          fieldName: "actionFinish",
          string: "Finalizar",
          variant: "info",
          invisible: getValues().state !== "in_process" || getValues().state === "cancel",
        },
        {
          action: actionAffected,
          fieldName: "actionAffected",
          string: "Crear",
          variant: "info",
          invisible: getValues().state !== "finished" || getValues().state === "cancel",
        },
        {
          action: actionCancel,
          fieldName: "actionCancel",
          string: "Cancelar",
          variant: "danger",
          invisible: getValues().state !== "in_process",
        },
      ]}
    >
      <FormViewGroup>
        <FieldRelation
          name="productId"
          label="Producto"
          model="productTemplate"
          domain={[["purchases", "=", false]]}
          searchColumns={[
            {
              field: "name",
              label: "Nombre",
            },
            {
              field: "purchases",
              label: "Se compra",
              type: "boolean",
            },
          ]}
          ponChange={async (value, record) => handleChangeProduct({ id: value, record: record as unknown as ProductTemplate })}
          readonly={getValues().state !== "draft"}
        />
        <FormViewStack>
          <FieldEntry name="quantity" label="Cantidad a fabricar" type="number" decimals={3} onChange={(value) => computeYield(value)} readonly={getValues().state !== "draft"} />
          <FieldRelation model="uomCategory" name="uomId" label="UdM" readonly />
        </FormViewStack>
        <FormViewStack>
          <FieldEntry name="yield" label="Rendimiento" type="number" decimals={3} readonly />
        </FormViewStack>
      </FormViewGroup>
      <FormViewGroup>
        <FieldRelation
          model="warehouse"
          name="whOriginId"
          label="Origen de los bienes"
          domain={[
            ["companyId", "=", companyId],
            ["type", "=", "PRODUCTION"],
          ]}
          readonly={getValues().state !== "draft"}
        />
        <FieldRelation
          model="warehouse"
          name="whDestId"
          label="Crear en destino"
          domain={[
            ["companyId", "=", companyId],
            ["type", "=", "SALES"],
          ]}
          readonly={getValues().state !== "draft"}
        />
        <FieldEntry name="date" readonly label="Fecha de fabricación" type="date" />
      </FormViewGroup>
      <Notebook defaultActiveKey="lines">
        <Page eventKey="lines" title="Ingredientes">
          <PageSheet name="ManufacturingLines">
            <Col md="12" className="p-0 m-0 overflow-auto">
              <SimpleTable
                data={fields}
                headers={[
                  { string: "Insumo", name: "lineIngredientId", width: 200, minWidth: 100 },
                  { string: "Cantidad", name: "lineOutQty", width: 80, minWidth: 50 },
                  { string: "UdM", name: "lineUomId", width: 50, minWidth: 45 },
                  {
                    string: <i className="bi bi-trash"></i>,
                    className: "text-center",
                    width: 25,
                    minWidth: 25,
                    name: "lineDelete",
                  },
                ]}
                resizable
                renderRow={(field, row) => (
                  <tr key={field.id} className="border-0 border-bottom">
                    <SimpleTD colIdx={row} name="lineIngredientId">
                      <FieldRelation
                        inline
                        model="productTemplate"
                        name={`ManufacturingLines.${row}.productIngredientId`}
                        domain={[["sales", "=", false]]}
                        ponChange={(_, record) => setUomId(record, row)}
                        readonly={getValues().state !== "draft"}
                      />
                    </SimpleTD>
                    <SimpleTD colIdx={row} name="lineOutQty">
                      <FieldEntry inline name={`ManufacturingLines.${row}.outQty`} type="number" decimals={3} readonly={getValues().state !== "draft"} />
                    </SimpleTD>
                    <SimpleTD colIdx={row} name="lineUomId">
                      <FieldRelation inline model="uomCategory" name={`ManufacturingLines.${row}.uomId`} readonly />
                    </SimpleTD>
                    <SimpleTD contentPosition="text-center" name="lineDelete" colIdx={row}>
                      <BtnDeleteLine action={() => remove(row)} disabled={getValues().state !== "draft"} />
                    </SimpleTD>
                  </tr>
                )}
                action={() => {
                  if (getValues().state !== "draft") return;
                  append({
                    outQty: 1.0,
                    productIngredientId: { id: "", name: "" },
                    uomId: { id: "", name: "" },
                  });
                }}
              />
            </Col>
          </PageSheet>
        </Page>
      </Notebook>
    </FormView>
  );
}

export default ManufacturingFormView;
