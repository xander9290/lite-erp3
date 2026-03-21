"use client";

import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  groupSchema,
  groupSchemaDefault,
  GroupSchemaType,
} from "../schemas/group.schema";
import { useCallback, useEffect, useRef } from "react";
import { useModals } from "@/contexts/ModalContext";
import {
  FormBook,
  FormPage,
  FormView,
  FormViewGroup,
  PageSheet,
} from "@/components/templates/FormView";
import {
  createGroup,
  GroupWithProps,
  updateGroup,
} from "../actions/groups-actions";
import {
  FieldBoolean,
  FieldEntry,
  FieldRelation,
  FieldRelationTags,
} from "@/components/templates/fields";
import toast from "react-hot-toast";
import { Col } from "react-bootstrap";
import {
  BtnDeleteLine,
  SimpleTable,
  SimpleTD,
} from "@/components/templates/simpletemplates";

function GroupFormView({
  id,
  group,
}: {
  id: string | null;
  group: GroupWithProps | null;
}) {
  const methods = useForm<GroupSchemaType>({
    resolver: zodResolver(groupSchema),
    defaultValues: groupSchemaDefault,
  });

  const { control } = methods;

  const { append, fields, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const { reset } = methods;
  const { modalError } = useModals();

  const originalValuesRef = useRef<GroupSchemaType | null>(null);
  const router = useRouter();

  const onSubmit: SubmitHandler<GroupSchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createGroup({
        ...data,
        users: data.users.map((u) => u),
      });

      if (!res.success) return modalError(res.message);

      router.replace(`/app/groups?view_type=form&id=${res.data?.id}`);
      toast.success(res.message);
    } else {
      const res = await updateGroup({ id, ...data });

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

  const setGroup = useCallback(() => {
    if (!group) {
      const values: GroupSchemaType = {
        name: "",
        active: true,
        users: [],
        lines: [],
        createdAt: null,
        updatedAt: null,
      };
      reset(values);
      originalValuesRef.current = values;
    } else {
      const values: GroupSchemaType = {
        name: group.name,
        active: group.active,
        users: group.Users.map((u) => u.id) ?? [],
        lines:
          group.GroupLines.map((line) => ({
            id: line.id,
            fieldId: line.fieldId,
            invisible: line.invisible,
            required: line.required,
            readonly: line.readonly,
            notCreate: line.notCreate,
            notEdit: line.notEdit,
          })) || [],
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      };
      reset(values);
      originalValuesRef.current = values;
    }
  }, [group, reset]);

  useEffect(() => {
    setGroup();
  }, [setGroup]);

  return (
    <FormView
      cleanUrl="/app/groups?view_type=form&id=null"
      reverse={handleReverse}
      onSubmit={onSubmit}
      methods={methods}
      auditLog="groups"
      id={id}
    >
      <FormViewGroup>
        <FieldEntry name="name" label="Nombre" />
        <FieldBoolean name="active" label="Activo" />
      </FormViewGroup>
      <FormViewGroup>
        <FieldRelationTags
          model="user"
          label="Usuarios"
          name="users"
          domain={[["name", "!=", "bot"]]}
        />
      </FormViewGroup>
      <FormBook dKey="groupLine">
        <FormPage eventKey="groupLine" title="Accesos">
          <PageSheet name="groupLines">
            <Col className="p-0">
              <SimpleTable
                data={fields}
                headers={[
                  {
                    string: "Campo",
                    name: "fieldId",
                    width: 200,
                    minWidth: 100,
                  },
                  {
                    string: "Invisible",
                    name: "invisible",
                    width: 50,
                    minWidth: 45,
                  },
                  {
                    string: "Requerido",
                    name: "required",
                    width: 50,
                    minWidth: 45,
                  },
                  {
                    string: "Solo lectura",
                    name: "readonly",
                    width: 50,
                    minWidth: 45,
                  },
                  {
                    string: "No crear",
                    name: "lineNotCreate",
                    width: 50,
                    minWidth: 45,
                  },
                  {
                    string: "No editar",
                    name: "notEdit",
                    width: 50,
                    minWidth: 45,
                  },
                  {
                    string: <i className="bi bi-trash"></i>,
                    className: "text-center",
                    width: 35,
                    minWidth: 30,
                    name: "lineDelete",
                  },
                ]}
                renderRow={(row, index) => {
                  return (
                    <tr key={row.id} className="border-0 border-bottom">
                      <SimpleTD name="lineField" colIdx={index}>
                        <FieldRelation
                          inline
                          model="modelField"
                          name={`lines.${index}.fieldId`}
                          searchColumns={[
                            {
                              key: "name",
                              label: "Nombre",
                              accessor: (r) => r.name,
                              filterable: true,
                              type: "string",
                            },
                            {
                              key: "label",
                              label: "Etiqueta",
                              accessor: (r) => r.label,
                              filterable: true,
                              type: "string",
                            },
                            {
                              key: "description",
                              label: "Descripción",
                              accessor: (r) => r.description,
                              filterable: true,
                              type: "string",
                            },
                            {
                              key: "Model.name",
                              label: "Modelo",
                              accessor: (r) => r.Model?.name,
                              filterable: true,
                              type: "string",
                            },
                          ]}
                        />
                      </SimpleTD>
                      <SimpleTD name="lineInvisible" colIdx={index}>
                        <FieldBoolean
                          type="checkbox"
                          inline
                          name={`lines.${index}.invisible`}
                        />
                      </SimpleTD>
                      <SimpleTD name="lineRequired" colIdx={index}>
                        <FieldBoolean
                          type="checkbox"
                          inline
                          name={`lines.${index}.required`}
                        />
                      </SimpleTD>
                      <SimpleTD name="lineReadonly" colIdx={index}>
                        <FieldBoolean
                          type="checkbox"
                          inline
                          name={`lines.${index}.readonly`}
                        />
                      </SimpleTD>
                      <SimpleTD name="lineNotCreate" colIdx={index}>
                        <FieldBoolean
                          type="checkbox"
                          inline
                          name={`lines.${index}.notCreate`}
                        />
                      </SimpleTD>
                      <SimpleTD name="lineNotEdit" colIdx={index}>
                        <FieldBoolean
                          type="checkbox"
                          inline
                          name={`lines.${index}.notEdit`}
                        />
                      </SimpleTD>
                      <SimpleTD
                        name="lineDelete"
                        colIdx={index}
                        contentPosition="text-center"
                      >
                        <BtnDeleteLine action={() => remove(index)} />
                      </SimpleTD>
                    </tr>
                  );
                }}
                action={() =>
                  append({
                    fieldId: "",
                    invisible: false,
                    required: false,
                    readonly: false,
                    notCreate: false,
                    notEdit: false,
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

export default GroupFormView;
