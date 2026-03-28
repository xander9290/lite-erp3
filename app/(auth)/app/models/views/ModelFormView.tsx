"use client";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  modelSchema,
  modelSchemaDefault,
  ModelSchemaType,
} from "../schemas/model.schema";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useModals } from "@/contexts/ModalContext";
import {
  FormBook,
  FormPage,
  FormView,
  FormViewGroup,
  PageSheet,
} from "@/components/templates/FormView";
import {
  createModel,
  ModelWithProps,
  updateModel,
} from "../actions/model-actions";
import {
  FieldBoolean,
  FieldEntry,
  FieldSelect,
} from "@/components/templates/fields";
import toast from "react-hot-toast";
import { Col } from "react-bootstrap";
import {
  BtnDeleteLine,
  SimpleTable,
  SimpleTD,
} from "@/components/templates/simpletemplates";

function ModelFormView({
  id,
  entity,
}: {
  id: string | null;
  entity: ModelWithProps | null;
}) {
  const methods = useForm<ModelSchemaType>({
    resolver: zodResolver(modelSchema),
    defaultValues: modelSchemaDefault,
  });

  const { reset, control } = methods;

  const { append, fields, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const fieldTypes = [
    { value: "string", label: "string" },
    { value: "number", label: "number" },
    { value: "relation", label: "relation" },
    { value: "action", label: "action" },
    { value: "link", label: "link" },
    { value: "boolean", label: "boolean" },
    { value: "date", label: "date" },
    { value: "datetime", label: "datetime" },
  ];

  const originalValuesRef = useRef<ModelSchemaType | null>(null);
  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<ModelSchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createModel({ data });
      if (!res.success) return modalError(res.message);

      router.replace(`/app/models?view_type=form&id=${res.data?.id}`);
      toast.success(res.message);
    } else {
      const res = await updateModel({ data: { id, ...data } });
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
    if (!entity) {
      reset(modelSchemaDefault);
      originalValuesRef.current = modelSchemaDefault;
    } else {
      const values: ModelSchemaType = {
        name: entity.name,
        label: entity.label,
        description: entity.description,
        active: entity.active,
        lines:
          entity.ModelFields.map((f) => ({
            id: f.id,
            name: f.name,
            label: f.label,
            description: f.description,
            active: f.active,
            fieldType: f.fieldType,
          })) || [],
      };
      originalValuesRef.current = values;
      reset(values);
    }
  }, [entity, reset]);

  return (
    <FormView
      cleanUrl="/app/models?view_type=form&id=null"
      reverse={handleReverse}
      onSubmit={onSubmit}
      methods={methods}
      id={id}
      auditLog="models"
    >
      <FormViewGroup>
        <FieldEntry name="label" label="Etiqueta" />
        <FieldEntry name="description" label="Descripción" />
        <FieldBoolean name="active" label="Activo" />
      </FormViewGroup>
      <FormBook dKey="modelFields">
        <FormPage title="Campos" eventKey="modelFields">
          <PageSheet>
            <Col md="12" className="p-0 m-0 overflow-auto">
              <SimpleTable
                data={fields}
                headers={[
                  {
                    string: "Nombre",
                    width: 260,
                    minWidth: 230,
                    name: "lineName",
                  },
                  {
                    string: "Tipo",
                    width: 75,
                    minWidth: 75,
                    name: "lineFieldType",
                  },
                  {
                    string: "Etiqueta",
                    width: 230,
                    minWidth: 170,
                    name: "lineLabel",
                  },
                  {
                    string: "Descripción",
                    width: 260,
                    minWidth: 195,
                    name: "lineDescription",
                  },
                  {
                    string: "Activo",
                    width: 35,
                    minWidth: 35,
                    name: "lineActive",
                  },
                  {
                    string: <i className="bi bi-trash"></i>,
                    className: "text-center",
                    width: 25,
                    minWidth: 25,
                    name: "lineDelete",
                  },
                ]}
                renderRow={(row, index) => (
                  <tr key={row.id} className="border-0 border-bottom">
                    <SimpleTD name="lineName" colIdx={index}>
                      <FieldEntry
                        inline
                        name={`lines.${index}.name`}
                        readonly
                      />
                    </SimpleTD>
                    <SimpleTD name="lineFieldType" colIdx={index}>
                      <FieldSelect
                        name={`lines.${index}.fieldType`}
                        options={fieldTypes}
                        inline
                      />
                    </SimpleTD>
                    <SimpleTD name="lineLabel" colIdx={index}>
                      <FieldEntry inline name={`lines.${index}.label`} />
                    </SimpleTD>
                    <SimpleTD name="lineDescription" colIdx={index}>
                      <FieldEntry inline name={`lines.${index}.description`} />
                    </SimpleTD>
                    <SimpleTD
                      name="lineActive"
                      colIdx={index}
                      contentPosition="text-center"
                    >
                      <FieldBoolean inline name={`lines.${index}.active`} />
                    </SimpleTD>
                    <SimpleTD name="lineDelete" colIdx={index}>
                      <BtnDeleteLine action={() => remove(index)} />
                    </SimpleTD>
                  </tr>
                )}
                action={() =>
                  append({
                    name: "",
                    label: "",
                    description: "",
                    active: true,
                    fieldType: "string",
                  })
                }
              />
            </Col>
          </PageSheet>
        </FormPage>
      </FormBook>
    </FormView>
  );
}

export default ModelFormView;
