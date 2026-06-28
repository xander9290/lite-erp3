"use client";

import { ModalBasicProps } from "@/app/libs/definitions";
import { Col, Form, Modal, Row } from "react-bootstrap";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { partnerChildrenSchema, partnerChildrenSchemaDefault, PartnerChildrenType } from "../schemas/partner.schema";
import { FieldAction, FieldEntry, FieldSubmit } from "@/components/templates/fields";
import { FormViewGroup, FormViewStack } from "@/components/templates/FormView";
import { FieldOption } from "@/components/templates/fields/FielOption";

function ModalCreateChild({ onHide, show, submitNewChild }: ModalBasicProps & { submitNewChild: (data: PartnerChildrenType) => void }) {
  const methods = useForm<PartnerChildrenType>({
    resolver: zodResolver(partnerChildrenSchema),
    defaultValues: partnerChildrenSchemaDefault,
  });

  const { handleSubmit, reset } = methods;

  const onSubmit: SubmitHandler<PartnerChildrenType> = (data) => {
    const completeAddress = [data.street, data.houseNumber].filter(Boolean).join(", ");
    submitNewChild({ ...data, completeAddress, id: "" });
    onHide();
  };

  const handleReverse = () => {
    reset(partnerChildrenSchemaDefault);
  };

  return (
    <Modal onHide={onHide} show={show} backdrop="static" size="lg" onExited={handleReverse}>
      <Modal.Header closeButton>
        <Modal.Title className="fw-semibold fs-5">Contactos y direcciones</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormProvider {...methods}>
          <Form className="container-fluid bg-body-tertiary rounded" noValidate onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-2">
              <Col md="12">
                <FieldOption
                  name="displayType"
                  options={[
                    { option: "Contacto", value: "CONTACT" },
                    { option: "Entrega", value: "DELIVERY" },
                  ]}
                  widget="radio"
                  label="Tipo"
                />
              </Col>
              <FormViewGroup>
                <FieldEntry name="name" label="Nombre" autoFocus />
                <FieldEntry name="street" label="Calle" />
                <FormViewStack>
                  <FieldEntry name="houseNumber" label="Casa" />
                  <FieldEntry name="town" label="Colonia" />
                </FormViewStack>
              </FormViewGroup>
              <FormViewGroup>
                <FieldEntry name="mobile" label="Móvil" />
                <FieldEntry name="phone" label="Teléfono" />
                <FieldEntry name="obs" label="Observaciones" as="textarea" />
              </FormViewGroup>
            </Row>
            <Row>
              <Col md="12" className="mb-2 text-end">
                <FieldAction variant="secondary" className="me-2" action={onHide} label="Cancelar" name="reverseChildren" />
                <FieldSubmit name="onsubmitChildren" label="Aceptar" />
              </Col>
            </Row>
          </Form>
        </FormProvider>
      </Modal.Body>
    </Modal>
  );
}

export default ModalCreateChild;
