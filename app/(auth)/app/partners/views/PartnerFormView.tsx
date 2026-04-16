"use client";

import { PartnerWithProps, updatePartner } from "../actions/partner-actions";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  partnerSchema,
  partnerSchemaDefault,
  PartnerSchemaType,
} from "../schemas/partner.schema";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useModals } from "@/contexts/ModalContext";
import { PartnerDisplayType } from "@/generated/prisma/enums";
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
} from "@/components/templates/fields";
import { Notebook, Page, PageSheet } from "@/components/templates/Notebook";
import toast from "react-hot-toast";

function PartnersFormView({
  display,
  partner,
  id,
}: {
  display: string;
  partner: PartnerWithProps | null;
  id: string | null;
}) {
  const methods = useForm<PartnerSchemaType>({
    resolver: zodResolver(partnerSchema),
    defaultValues: partnerSchemaDefault,
  });

  const { reset } = methods;

  const originalValuesRef = useRef<PartnerSchemaType | null>(null);
  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<PartnerSchemaType> = async (data) => {
    if (id && id === "null") {
    } else {
      const res = await updatePartner({ id, data });
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
    if (!partner) {
      reset(partnerSchemaDefault);
      originalValuesRef.current = partnerSchemaDefault;
      return;
    }

    const values: PartnerSchemaType = {
      name: partner.name,
      email: partner.email,
      imageUrl: partner.imageUrl,
      phone: partner.phone,
      street: partner.street,
      streets: partner.streets,
      houseNumber: partner.houseNumber,
      town: partner.town,
      county: partner.county,
      province: partner.province,
      country: partner.country,
      active: partner.active,
      displayType: display as PartnerDisplayType,
      vat: partner.vat,
      zip: partner.zip,
      userId: {
        id: partner.UserManager?.id || null,
        name: partner.UserManager?.name || null,
      },
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
      createdUid: partner.createdUid,
    };

    reset(values);
    originalValuesRef.current = values;
  }, [reset, display, partner]);

  return (
    <FormView
      cleanUrl={`/app/partners?view_type=form&display=${display}&id=null`}
      reverse={handleReverse}
      auditLog="partners"
      onSubmit={onSubmit}
      methods={methods}
      id={id}
    >
      <FormViewGroup>
        <FieldImage folder="partners" name="imageUrl" />
        <FieldEntry name="name" label="Nombre" />
        <FieldEntry name="email" label="Correo" />
        <FieldEntry name="vat" label="R.F.C." />
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
        <FormViewStack>
          <FieldEntry name="town" label="Colonia" />
          <FieldEntry name="county" label="Municipio" />
        </FormViewStack>
        <FormViewStack>
          <FieldEntry name="province" label="Estado" />
          <FieldEntry name="country" label="País" />
        </FormViewStack>
      </FormViewGroup>
      <Notebook defaultActiveKey="salePurchase">
        <Page eventKey="salePurchase" title="Cartera">
          <PageSheet name="salePurchase">
            <FormViewGroup>
              <FieldRelation
                name="userId"
                model="user"
                label="Responsable"
                domain={[["name", "!=", "bot"]]}
              />
            </FormViewGroup>
          </PageSheet>
        </Page>
      </Notebook>
    </FormView>
  );
}

export default PartnersFormView;
