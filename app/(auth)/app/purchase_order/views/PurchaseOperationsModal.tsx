"use client";

import { ModalBasicProps } from "@/app/libs/definitions";
import {
  FieldBoolean,
  FieldEntry,
  FieldRelation,
} from "@/components/templates/fields";
import { FormViewGroup } from "@/components/templates/FormView";
import { Notebook, Page, PageSheet } from "@/components/templates/Notebook";
import { SimpleTable, SimpleTD } from "@/components/templates/simpletemplates";
import { useAuth } from "@/hooks/sessionStore";
import { Button, Container, Form, Modal, Row } from "react-bootstrap";
import { FormProvider, UseFormReturn, useFieldArray } from "react-hook-form";

function PurchaseOperationsModal({
  onHide,
  show,
  methods,
  reverse,
}: ModalBasicProps & {
  methods: UseFormReturn<any>;
  reverse: () => void;
}) {
  const { companyId } = useAuth();

  const {
    getValues,
    formState: { isDirty },
    control,
    setValue,
  } = methods;

  const { fields: lines } = useFieldArray({
    control,
    name: "OrderLines",
  });

  const handleSelectAllAsReady = () => {
    const lines = getValues().OrderLines;
    lines.forEach((line: any, index: number) => {
      setValue(`OrderLines.${index}.ready`, !line.ready, { shouldDirty: true });
    });
  };

  return (
    <Modal onHide={onHide} show={show} size="xl" backdrop="static" centered>
      <Modal.Header closeButton>
        <span className="fw-bolder ms-1">#{getValues().name}</span>
      </Modal.Header>
      <Modal.Body className="p-0">
        <FormProvider {...methods}>
          <Form className="bg-body-tertiary">
            <fieldset disabled={getValues().state === "done"}>
              <Container className="mb-3">
                <Row>
                  <FormViewGroup>
                    <FieldRelation
                      model="warehouse"
                      name="warehouseDestId"
                      label="Origen"
                      readonly
                    />
                  </FormViewGroup>
                  <FormViewGroup>
                    <FieldRelation
                      model="warehouse"
                      name="warehouseAffectedId"
                      label="Destino"
                      domain={[
                        ["type", "in", ["SALES", "PRODUCTION"]],
                        ["companyId", "=", companyId],
                      ]}
                    />
                  </FormViewGroup>
                </Row>
                <Row>
                  <FormViewGroup>
                    <Button onClick={handleSelectAllAsReady}>
                      Todos listos
                    </Button>
                  </FormViewGroup>
                </Row>
              </Container>
              <Notebook defaultActiveKey="operations">
                <Page eventKey="operations" title="Operaciones">
                  <PageSheet name="purchaseOrderOperaionLine">
                    <SimpleTable
                      resizable
                      data={lines}
                      headers={[
                        {
                          string: "Producto",
                          name: "opeartionProductId",
                          width: 270,
                          minWidth: 170,
                        },
                        {
                          string: "Ordenado",
                          name: "operationQuantity",
                          width: 30,
                          minWidth: 30,
                        },
                        {
                          string: "UdM",
                          name: "opeartionUomId",
                          width: 50,
                          minWidth: 50,
                        },
                        {
                          string: "Recibido",
                          name: "operationReceivedQty",
                          width: 30,
                          minWidth: 30,
                        },
                        {
                          string: "Listo",
                          name: "operationReady",
                          width: 30,
                          minWidth: 30,
                        },
                      ]}
                      renderRow={(row, index) => (
                        <tr key={row.id} className="border-bottom">
                          <SimpleTD colIdx={index} name="operationProductId">
                            <FieldRelation
                              inline
                              model="productTemplate"
                              name={`OrderLines.${index}.productId`}
                              readonly
                            />
                          </SimpleTD>
                          <SimpleTD colIdx={index} name="operationQuantity">
                            <FieldEntry
                              inline
                              type="number"
                              decimals={3}
                              name={`OrderLines.${index}.quantity`}
                              readonly
                            />
                          </SimpleTD>
                          <SimpleTD colIdx={index} name="opeartionUomId">
                            <FieldRelation
                              inline
                              model="uomCategory"
                              name={`OrderLines.${index}.uomId`}
                              readonly
                            />
                          </SimpleTD>
                          <SimpleTD colIdx={index} name="operationReceivedQty">
                            <FieldEntry
                              inline
                              type="number"
                              decimals={3}
                              name={`OrderLines.${index}.receivedQty`}
                              readonly={
                                getValues().OrderLines[index].state !==
                                "pending"
                              }
                            />
                          </SimpleTD>
                          <SimpleTD
                            colIdx={index}
                            name="operationReady"
                            contentPosition="text-center"
                          >
                            <FieldBoolean
                              inline
                              name={`OrderLines.${index}.ready`}
                              readonly={
                                getValues().OrderLines[index].state !==
                                "pending"
                              }
                            />
                          </SimpleTD>
                        </tr>
                      )}
                    />
                  </PageSheet>
                </Page>
              </Notebook>
            </fieldset>
          </Form>
        </FormProvider>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={reverse} disabled={!isDirty} variant="secondary">
          Cancelar
        </Button>
        <Button type="button" disabled={!isDirty} onClick={onHide}>
          Aceptar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PurchaseOperationsModal;
