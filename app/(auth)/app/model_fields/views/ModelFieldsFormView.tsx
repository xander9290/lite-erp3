"use client";

import {
  modelFieldSchema,
  modelFieldSchemaDefault,
  ModelFieldSchemaType,
} from "../schemas/modelFields.schema";
import {
  createModelField,
  ModelFieldWithProps,
  updateModelField,
} from "../actions/fields-actions";
import { FormView, FormViewGroup } from "@/components/templates/FormView";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useModals } from "@/contexts/ModalContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  FieldBoolean,
  FieldEntry,
  FieldRelation,
  FieldSelect,
} from "@/components/templates/fields";
import toast from "react-hot-toast";

function ModelFieldsFormView({
  id,
  modelField,
}: {
  id: string | null;
  modelField: ModelFieldWithProps | null;
}) {
  const methods = useForm<ModelFieldSchemaType>({
    resolver: zodResolver(modelFieldSchema),
    defaultValues: modelFieldSchemaDefault,
  });

  const { reset } = methods;

  const originalValuesRef = useRef<ModelFieldSchemaType | null>(null);
  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<ModelFieldSchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createModelField({ data });
      if (!res.success) return modalError(res.message);
      router.replace(`/app/model_fields?view_type=form&id=${res.data?.id}`);
      toast.success(res.message);
    } else {
      const res = await updateModelField({ data: { id, ...data } });
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
    if (!modelField) {
      reset(modelFieldSchemaDefault);
      originalValuesRef.current = modelFieldSchemaDefault;
    } else {
      const values: ModelFieldSchemaType = {
        name: modelField.name,
        label: modelField.label,
        description: modelField.description,
        active: modelField.active,
        fieldType: modelField.fieldType,
        modelId: {
          id: modelField.Model.id,
          name: modelField.Model.name,
        },
        createdAt: modelField.createdAt,
        updatedAt: modelField.updatedAt,
        createdUid: modelField.createdUid,
      };
      reset(values);
      originalValuesRef.current = values;
    }
  }, [modelField, reset]);

  return (
    <FormView
      cleanUrl="/app/model_fields?view_type=form&id=null"
      reverse={handleReverse}
      onSubmit={onSubmit}
      methods={methods}
      id={id}
      auditLog="modelFields"
    >
      <FormViewGroup>
        <FieldEntry name="name" label="Nombre" readonly />
        <FieldEntry name="label" label="Etiqueta" />
        <FieldEntry name="description" label="Descripción" />
      </FormViewGroup>
      <FormViewGroup>
        <FieldSelect
          name="fieldType"
          label="Tipo"
          options={[
            { label: "Texto", value: "string" },
            { label: "Número", value: "number" },
            { label: "Relación", value: "relation" },
            { label: "Acción", value: "action" },
            { label: "Enlace", value: "link" },
            { label: "Booleano", value: "boolean" },
            { label: "Fecha", value: "date" },
            { label: "Fecha y hora", value: "datetime" },
          ]}
        />
        <FieldRelation
          name="modelId"
          model="model"
          label="Modelo"
          searchColumns={[
            {
              key: "name",
              accessor: (r) => r.name,
              label: "Nombre",
              type: "string",
              filterable: true,
            },
            {
              key: "description",
              accessor: (r) => r.description,
              label: "Descripción",
              type: "string",
              filterable: true,
            },
          ]}
        />
        <FieldBoolean name="active" label="Activo" />
      </FormViewGroup>
    </FormView>
  );
}

export default ModelFieldsFormView;
