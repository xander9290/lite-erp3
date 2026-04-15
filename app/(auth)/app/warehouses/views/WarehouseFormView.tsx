"use client";

import {
  warehouseSchemaDefault,
  WarehouseSchemaType,
  warehouseSchema,
} from "../schemas/warehouse.schema";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useModals } from "@/contexts/ModalContext";
import {
  createWarehouse,
  updateWarehouse,
  WarehouseWithProps,
} from "../actions/warehouse-actions";
import { FormView, FormViewGroup } from "@/components/templates/FormView";
import {
  FieldBoolean,
  FieldEntry,
  FieldRelation,
  FieldRelationTags,
} from "@/components/templates/fields";
import { FieldOption } from "@/components/templates/fields/FielOption";
import { Notebook, Page, PageSheet } from "@/components/templates/Notebook";
import toast from "react-hot-toast";

function WarehouseFormView({
  id,
  warehouse,
}: {
  id: string | null;
  warehouse: WarehouseWithProps | null;
}) {
  const methods = useForm<WarehouseSchemaType>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: warehouseSchemaDefault,
  });

  const { reset } = methods;

  const originalValuesRef = useRef<WarehouseSchemaType | null>(null);
  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<WarehouseSchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createWarehouse({ data });
      if (!res.success) return modalError(res.message);

      router.replace(`/app/warehouses?view_type=form&id=${res.data?.id}`);
      toast.success(res.message);
    } else {
      const res = await updateWarehouse({ id, data });
      if (!res.success) return modalError(res.message);

      router.refresh();
      toast.success(res.message);
    }
  };

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  useEffect(() => {
    if (!warehouse) {
      reset(warehouseSchemaDefault);
      originalValuesRef.current = warehouseSchemaDefault;
      return;
    }

    const values: WarehouseSchemaType = {
      name: warehouse.name,
      code: warehouse.code,
      description: warehouse.description,
      active: warehouse.active,
      type: warehouse.type,
      companyId: {
        id: warehouse.Company.id,
        name: warehouse.Company.name,
      },
      internalIds:
        warehouse.InternalsFrom.map((i) => ({
          id: i.id,
          name: i.name,
        })) || [],
      createdUid: warehouse.createdUid,
      createdAt: warehouse.createdAt,
      updatedAt: warehouse.updatedAt,
    };
    reset(values);
    originalValuesRef.current = values;
  }, [warehouse, reset]);

  return (
    <FormView
      cleanUrl="/app/warehouses?view_type=form&id=null"
      reverse={handleReverse}
      auditLog="warehouses"
      onSubmit={onSubmit}
      methods={methods}
      id={id}
    >
      <FormViewGroup>
        <FieldEntry name="description" label="Descripción" />
        <FieldEntry name="code" label="Código" />
        <FieldRelationTags
          model="warehouse"
          name="internalIds"
          label="Acepta internos de"
          domain={[["id", "!=", id]]}
        />
      </FormViewGroup>
      <FormViewGroup>
        <FieldOption
          name="type"
          options={[
            { option: "VENTAS", value: "SALES" },
            { option: "COMPRA", value: "SUPPLY" },
            { option: "PRODUCCIÓN", value: "PRODUCTION" },
            { option: "CUARENTENA", value: "QUARANTINE" },
            { option: "AJUSTES", value: "ADJUSTMENT" },
            { option: "TRÁNSITO", value: "TRANSIT" },
          ]}
          label="Tipo"
        />
        <FieldRelation model="company" name="companyId" label="Empresa" />
        <FieldBoolean name="active" label="Activo" />
      </FormViewGroup>
      <Notebook defaultActiveKey="otherInfo">
        <Page eventKey="otherInfo" title="Otra información">
          <PageSheet name="otherInfo">
            <FormViewGroup>
              <FieldEntry
                name="createdAt"
                type="datetime-local"
                label="Creado el"
                readonly
              />
              <FieldEntry
                name="updatedAt"
                type="datetime-local"
                label="Última actualización"
                readonly
              />
            </FormViewGroup>
          </PageSheet>
        </Page>
      </Notebook>
    </FormView>
  );
}

export default WarehouseFormView;
