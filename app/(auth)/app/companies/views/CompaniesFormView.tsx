"use client";

import {
  createCompany,
  updateCompany,
  type CompanieWithProps,
} from "../actions/companies-actions";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  companySchema,
  companySchemaDefault,
  CompanySchemaType,
} from "../schemas/company.schema";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useModals } from "@/contexts/ModalContext";
import {
  FormView,
  FormViewGroup,
  FormViewStack,
} from "@/components/templates/FormView";
import {
  FieldBoolean,
  FieldEntry,
  FieldImage,
  FieldRelation,
  FieldRelationTags,
} from "@/components/templates/fields";
import {
  BtnDeleteLine,
  SimpleTable,
  SimpleTD,
} from "@/components/templates/simpletemplates";
import toast from "react-hot-toast";
import { Notebook, Page, PageSheet } from "@/components/templates/Notebook";
import { Col } from "react-bootstrap";

function CompaniesFormView({
  company,
  id,
}: {
  company: CompanieWithProps | null;
  id: string | null;
}) {
  const methods = useForm<CompanySchemaType>({
    resolver: zodResolver(companySchema),
    defaultValues: companySchemaDefault,
  });

  const { reset, control } = methods;

  const { append, fields, remove } = useFieldArray({
    control,
    name: "childrenIds",
  });

  const originalValuesRef = useRef<CompanySchemaType | null>(null);
  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<CompanySchemaType> = async (data) => {
    if (id && id === "null") {
      const res = await createCompany({ data });
      if (!res.success) return modalError(res.message);
      router.replace(`/app/companies?view_type=form&id=${res.data?.id}`);
      toast.success(res.message);
    } else {
      const res = await updateCompany({ data: { id, ...data } });
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
    if (!company) {
      reset(companySchemaDefault);
      originalValuesRef.current = companySchemaDefault;
    } else {
      const values: CompanySchemaType = {
        name: company.name,
        code: company.code,
        active: company.active,
        imageUrl: company.Partner.imageUrl,
        street: company.Partner.street || "",
        houseNumber: company.Partner.houseNumber || "",
        streets: company.Partner.streets || "",
        zip: company.Partner.zip || 0,
        town: company.Partner.town || "",
        county: company.Partner.county || "",
        province: company.Partner.province || "",
        country: company.Partner.country || "",
        phone: company.Partner.phone || "",
        vat: company.Partner.vat || "",
        userIds: company.Users.map((u) => ({ id: u.id, name: u.name })) || [],
        managerId: {
          id: company.Manager?.id || "",
          name: company.Manager?.name || "",
        },
        partnerId: company.partnerId,
        parentId: {
          id: company.parentId || "",
          name: company.Company?.name || "",
        },
        childrenIds:
          company.Children.map((ch) => ({
            companyId: {
              id: ch.id,
              name: ch.name,
            },
            managerId: {
              id: ch.Manager?.id || "",
              name: ch.Manager?.name || "",
            },
          })) || [],
        createdUid: company.createdUid,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      };
      reset(values);
      originalValuesRef.current = values;
      console.log(values);
    }
  }, [company, reset]);

  return (
    <FormView
      cleanUrl="/app/companies?view_type=form&id=null"
      reverse={handleReverse}
      auditLog="companies"
      onSubmit={onSubmit}
      methods={methods}
      id={id}
    >
      <FormViewGroup>
        <FieldImage folder="companies" name="imageUrl" />
        <FieldRelation
          model="user"
          name="managerId"
          label="Gerente"
          domain={[["active", "=", true]]}
          searchColumns={[
            {
              key: "name",
              accessor: (r) => r.name,
              label: "Nombre",
              type: "string",
              filterable: true,
            },
            {
              key: "login",
              label: "Usuario",
              fieldName: "login",
              accessor: (u) => u.login,
              filterable: true,
              type: "string",
            },
          ]}
        />
      </FormViewGroup>
      <FormViewGroup>
        <FieldEntry name="name" label="Nombre" />
        <FieldEntry name="code" label="Código" />
        <FieldRelation
          model="company"
          name="parentId"
          label="Empresa"
          domain={[
            ["active", "=", true],
            ["id", "!=", id],
          ]}
        />
        <FieldBoolean name="active" label="Activo" />
      </FormViewGroup>
      <FormViewGroup>
        <FieldEntry name="street" label="Calle" />
        <FormViewStack>
          <FieldEntry name="houseNumber" label="No. Ext." />
          <FieldEntry
            name="zip"
            label="C.P. #"
            type="number"
            className="text-center"
          />
        </FormViewStack>
        <FieldEntry name="streets" label="Entre calles" />
        <FieldEntry name="town" label="Colonia" />
      </FormViewGroup>
      <FormViewGroup>
        <FieldEntry name="county" label="Municipio" />
        <FieldEntry name="province" label="Estado" />
        <FieldEntry name="country" label="País" />
        <FieldEntry name="vat" label="R.F.C." />
      </FormViewGroup>
      {/* <FormBook dKey="userIds">
        <FormPage title="Sucursales" eventKey="childrenIds">
          
        </FormPage>
      </FormBook> */}
      <Notebook defaultActiveKey="userIds">
        <Page title="Usuarios" eventKey="userIds">
          <PageSheet name="userIds">
            <FormViewGroup>
              <FieldRelationTags model="user" name="userIds" label="Usuarios" />
            </FormViewGroup>
          </PageSheet>
        </Page>
        <Page title="Sucursales" eventKey="childrenIds">
          <PageSheet name="childrenIds">
            <Col className="p-0">
              <SimpleTable
                data={fields}
                headers={[
                  {
                    string: "Nombre",
                    name: "lineName",
                    width: 200,
                    minWidth: 180,
                  },
                  {
                    string: "Gerente",
                    name: "lineManagerId",
                    width: 180,
                    minWidth: 140,
                  },
                  {
                    string: <i className="bi bi-trash"></i>,
                    className: "text-center",
                    width: 35,
                    minWidth: 30,
                    name: "lineDelete",
                  },
                ]}
                renderRow={(row, index) => (
                  <tr key={row.id} className="border-bottom">
                    <SimpleTD colIdx={index} name="lineName">
                      <FieldRelation
                        model="company"
                        name={`childrenIds.${index}.companyId`}
                        label="Empresa"
                        domain={[
                          ["active", "=", true],
                          ["id", "!=", id],
                        ]}
                        inline
                      />
                    </SimpleTD>
                    <SimpleTD colIdx={index} name="lineManagerId">
                      <FieldRelation
                        model="user"
                        name={`childrenIds.${index}.managerId`}
                        label="Gerente"
                        readonly
                        inline
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
                )}
                action={() =>
                  append({
                    companyId: {
                      id: "",
                      name: "",
                    },
                    managerId: {
                      id: "",
                      name: "",
                    },
                  })
                }
              />
            </Col>
          </PageSheet>
        </Page>
      </Notebook>
    </FormView>
  );
}

export default CompaniesFormView;
