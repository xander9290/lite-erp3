"use client";

import {
  craetePartner,
  PartnerWithProps,
  updatePartner,
} from "../actions/partner-actions";
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
import {
  FormView,
  FormViewGroup,
  FormViewStack,
} from "@/components/templates/FormView";
import {
  FieldAction,
  FieldBoolean,
  FieldEntry,
  FieldImage,
  FieldRelation,
  FieldSelect,
  FieldTags,
} from "@/components/templates/fields";
import { Notebook, Page, PageSheet } from "@/components/templates/Notebook";
import toast from "react-hot-toast";
import { Card, Col } from "react-bootstrap";
import { WidgetBadgeStatus } from "@/components/widgets";

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

  const { reset, getValues } = methods;

  const originalValuesRef = useRef<PartnerSchemaType | null>(null);
  const router = useRouter();

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<PartnerSchemaType> = async (data) => {
    if (data.zip && isNaN(Number(data.zip)))
      return modalError("Código postal inválido");

    if (data.displayType !== "CONTACT" && data.displayType !== "DELIVERY") {
      if (data.displayType !== display) {
        return modalError("Verifica el tipo de contacto");
      }
    }

    if (id && id === "null") {
      const res = await craetePartner({ data });
      if (!res.success) return modalError(res.message);
      router.replace(
        `/app/partners?view_type=form&id=${res.data?.id}&display=${res.data?.displayType}`,
      );
      toast.success(res.message);
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
      mobile: partner.mobile,
      street: partner.street,
      streets: partner.streets,
      houseNumber: partner.houseNumber,
      town: partner.town,
      county: partner.county,
      province: partner.province,
      country: partner.country,
      active: partner.active,
      displayType: partner.displayType,
      vat: partner.vat,
      zip: String(partner.zip),
      userId: {
        id: partner.UserManager?.id || null,
        name: partner.UserManager?.name || null,
      },
      Tags: partner.Tags.map((t) => t.id),
      Children: partner.Children.map((p) => ({
        id: p.id,
        name: p.name,
        mobile: p.mobile,
        displayType: p.displayType,
        completeAddress: p.completeAddress,
      })),
      parentId: {
        id: partner.Parent?.id,
        name: partner.Parent?.name,
      },
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
      createdUid: partner.createdUid,
    };

    reset(values);
    originalValuesRef.current = values;
  }, [reset, display, partner]);

  const goToParent = () => {
    return router.push(
      `/app/partners?view_type=form&display=${partner?.Parent?.displayType}&id=${partner?.Parent?.id}`,
    );
  };

  return (
    <FormView
      cleanUrl={`/app/partners?view_type=form&display=${display}&id=null`}
      reverse={handleReverse}
      auditLog="partners"
      onSubmit={onSubmit}
      methods={methods}
      id={id}
      state={getValues().displayType}
      formStates={[
        {
          name: "CUSTOMER",
          label: "CLIENTE",
          decoration: "primary",
        },
        {
          name: "SUPPLIER",
          label: "PROVEEDOR",
          decoration: "info",
        },
        {
          name: "INTERNAL",
          label: "INTERNO",
          decoration: "warning",
        },
        {
          name: "CONTACT",
          label: "CONTACTO",
          decoration: "info",
        },
        {
          name: "DELIVERY",
          label: "ENTREGA",
          decoration: "warning",
        },
      ]}
      actions={[
        {
          action: goToParent,
          fieldName: "actionGoToParent",
          string: (
            <>
              <i className="bi bi-person-lines-fill me-1"></i>
              <span>Relacionado</span>
            </>
          ),
          invisible: ["CUSTOMER", "INTERNAL", "SUPPLIER"].includes(
            getValues().displayType,
          ),
        },
      ]}
    >
      <FormViewGroup>
        <FieldImage folder="partners" name="imageUrl" />
        <FieldEntry name="name" label="Nombre" />
        <FieldEntry name="email" label="Correo" />
        <FormViewStack>
          <FieldEntry name="phone" label="Teléfono" />
          <FieldEntry name="mobile" label="Móvil" />
        </FormViewStack>
        <FieldEntry name="vat" label="R.F.C." />
      </FormViewGroup>
      <FormViewGroup>
        <FieldEntry name="street" label="Calle" />
        <FormViewStack>
          <FieldEntry name="houseNumber" label="No. Ext." />
          <FieldEntry name="zip" label="C.P. #" className="text-center" />
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
        <FieldTags name="Tags" label="Etiquetas" />
        <FieldBoolean name="active" label="Activo" />
      </FormViewGroup>
      <Notebook defaultActiveKey="children">
        <Page eventKey="children" title="Contactos y direcciones">
          <PageSheet name="children">
            {getValues().Children.map((chi) => (
              <Col md="4" className="py-1" key={chi.id}>
                <Card
                  className="shadow-sm hover-shadow transition"
                  style={{ fontSize: "0.9em", height: "76.3%" }}
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <Card.Title className="fs-6 fw-semibold">
                        {chi.name}
                      </Card.Title>
                      <WidgetBadgeStatus
                        value={chi.displayType}
                        options={{
                          CONTACT: { label: "Contacto", color: "info" },
                          DELIVERY: { label: "Entrega", color: "warning" },
                        }}
                      />
                    </div>
                    <Card.Text>
                      <>
                        <i className="bi bi-geo-alt me-1"></i>
                        {chi.completeAddress}
                      </>
                    </Card.Text>
                    {chi.mobile && (
                      <div className="small text-muted">
                        <i className="bi bi-telephone me-1"></i>
                        {chi.mobile}
                      </div>
                    )}
                    <div className="text-end">
                      <FieldAction
                        action={() =>
                          router.push(
                            `/app/partners?view_type=form&display=${chi.displayType}&id=${chi.id}`,
                          )
                        }
                        label="Ver más"
                        name="editChild"
                        size="sm"
                        variant="link"
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </PageSheet>
        </Page>
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
        <Page eventKey="otherInfo" title="Otra información">
          <PageSheet name="otherInfo">
            <FormViewGroup>
              <FieldSelect
                name="displayType"
                label="Tipo"
                options={[
                  { label: "Cliente", value: "CUSTOMER" },
                  { label: "Proveedor", value: "SUPPLIER" },
                  { label: "Interno", value: "INTERNAL" },
                  { label: "Contacto", value: "CONTACT" },
                  { label: "Entrega", value: "DELIVERY" },
                ]}
              />
              <FieldRelation
                name="parentId"
                label="Relacionado"
                model="partner"
                domain={[["displayType", "in", ["CUSTOMER"]]]}
              />
            </FormViewGroup>
          </PageSheet>
        </Page>
      </Notebook>
    </FormView>
  );
}

export default PartnersFormView;
