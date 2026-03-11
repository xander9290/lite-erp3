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
import { FieldBoolean, FieldEntry } from "@/components/templates/fields";
import toast from "react-hot-toast";
import SimpleTable from "@/components/templates/SimpleTable";
import { Button } from "react-bootstrap";
import {
  FieldOption,
  SelectOption,
} from "@/components/templates/fields/FielOption";

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

  const fieldTypes: SelectOption[] = [
    { value: "string", option: "string" },
    { value: "number", option: "number" },
    { value: "relation", option: "relation" },
    { value: "action", option: "action" },
    { value: "link", option: "link" },
    { value: "boolean", option: "boolean" },
    { value: "date", option: "date" },
    { value: "datetime", option: "datetime" },
  ];

  const originalValuesRef = useRef<ModelSchemaType | null>(null);
  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<ModelSchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createModel(data);
      if (!res.success) return modalError(res.message);

      router.replace(`/app/models?view_type=form&id=${res.data?.id}`);
      toast.success(res.message);
    } else {
      const res = await updateModel({ id, ...data });
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
      const values: ModelSchemaType = {
        name: "",
        label: "",
        description: "",
        active: false,
        lines: [],
      };
      originalValuesRef.current = values;
      reset(values);
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
            <SimpleTable
              data={fields}
              headers={[
                { string: "Nombre" },
                { string: "Tipo" },
                { string: "Etiqueta" },
                { string: "Descripción" },
                { string: "Activo" },
                {
                  string: <i className="bi bi-trash"></i>,
                  className: "text-center",
                },
              ]}
              renderRow={(row, index) => (
                <tr key={row.id} className="border-0 border-bottom">
                  <td valign="middle" className="p-0">
                    <FieldEntry inline name={`lines.${index}.name`} readonly />
                  </td>
                  <td valign="middle" className="p-0">
                    <FieldOption
                      inline
                      name={`lines.${index}.fieldType`}
                      options={fieldTypes}
                    />
                  </td>
                  <td valign="middle" className="p-0">
                    <FieldEntry inline name={`lines.${index}.label`} />
                  </td>
                  <td valign="middle" className="p-0">
                    <FieldEntry inline name={`lines.${index}.description`} />
                  </td>
                  <td valign="middle" className="text-center p-0">
                    <FieldBoolean inline name={`lines.${index}.active`} />
                  </td>
                  <td className="text-center p-0" valign="middle">
                    <Button
                      size="sm"
                      variant="link"
                      onClick={() => remove(index)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
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
          </PageSheet>
        </FormPage>
      </FormBook>
    </FormView>
  );
}

export default ModelFormView;
