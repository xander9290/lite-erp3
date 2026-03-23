"use client";

import type { CompanieWithProps } from "../actions/companies-actions";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isEqual } from "lodash";
import {
  companySchema,
  companySchemaDefault,
  CompanySchemaType,
} from "../schemas/company.schema";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useModals } from "@/contexts/ModalContext";
import {
  FormBook,
  FormPage,
  FormView,
  FormViewFluid,
  FormViewGroup,
  FormViewStack,
  PageSheet,
} from "@/components/templates/FormView";
import {
  FieldBoolean,
  FieldEntry,
  FieldImage,
  FieldRelation,
  FieldRelationTags,
  WidgetAvatar,
} from "@/components/templates/fields";

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

  const { reset } = methods;

  const originalValuesRef = useRef<CompanySchemaType | null>(null);
  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<CompanySchemaType> = async (data) => {};

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
        userIds: company.Users.map((u) => u.id) || [],
        managerId: company.managerId,
        partnerId: company.partnerId,
        parentId: company.parentId,
        childrenIds:
          company.Children.map((ch) => ({
            id: ch.id,
            managerId: ch.managerId || "",
            name: ch.name,
          })) || [],
        createdUid: company.createdUid,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      };
      reset(values);
      originalValuesRef.current = values;
    }
  }, [company, reset]);

  const isReallyDirty = !isEqual(methods.watch(), originalValuesRef.current);

  return (
    <FormView
      cleanUrl="/app/companies?view_type=form&id=null"
      isReallyDirty={isReallyDirty}
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
              render: (u) => (
                <div className="d-flex flex-row align-items-end gap-2">
                  <span onClick={(e) => e.stopPropagation()}>
                    <WidgetAvatar id={u.id} />
                  </span>
                  <span>{u.login}</span>
                </div>
              ),
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
          domain={[["active", "=", true]]}
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
      <FormBook dKey="userIds">
        <FormPage title="Usuarios" eventKey="userIds">
          <PageSheet name="userIds">
            <FormViewGroup>
              <FieldRelationTags model="user" name="userIds" label="Usuarios" />
            </FormViewGroup>
          </PageSheet>
        </FormPage>
        <FormPage title="Sucursales" eventKey="childrenIds">
          <PageSheet name="childrenIds">
            <h3>Sucursales</h3>
          </PageSheet>
        </FormPage>
      </FormBook>
    </FormView>
  );
}

export default CompaniesFormView;
