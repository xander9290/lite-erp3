"use client";

import { ModalBasicProps } from "@/app/libs/definitions";
import { FieldEntry, FieldRelation } from "@/components/templates/fields";
import { FormViewGroup } from "@/components/templates/FormView";
import { Notebook, Page, PageSheet } from "@/components/templates/Notebook";
import { SimpleTable, SimpleTD } from "@/components/templates/simpletemplates";
import { fields } from "@hookform/resolvers/ajv/src/__tests__/__fixtures__/data.js";
import { handleLog } from "next/dist/server/dev/browser-logs/receive-logs";
import { Button, Container, Form, Modal, Row, Spinner } from "react-bootstrap";
import { FormProvider, UseFormReturn, useFieldArray } from "react-hook-form";

function PurchaseOperationsModal({
  onHide,
  show,
  methods,
  onSubmit,
  reverse,
}: ModalBasicProps & {
  methods: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  reverse: () => void;
}) {
  const {
    handleSubmit,
    getValues,
    formState: { isSubmitting, isDirty },
    control,
  } = methods;

  const { fields: lines } = useFieldArray({
    control,
    name: "OrderLines",
  });

  return (
    <Modal onHide={onHide} show={show} size="xl" backdrop="static" centered>
      <Modal.Header closeButton>
        Operaciones de la orden
        <span className="fw-bolder ms-1">{getValues().name}</span>
      </Modal.Header>
      <Modal.Body className="p-0">
        <FormProvider {...methods}>
          <Form>
            <Container>
              <Row>
                <FormViewGroup>
                  <FieldRelation
                    model="warehouse"
                    name="warehouseDestId"
                    label="Origen"
                    readonly
                  />
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
                        name: "productId",
                        width: 270,
                        minWidth: 170,
                      },
                      {
                        string: "Cantidad",
                        name: "quantity",
                        width: 30,
                        minWidth: 30,
                      },
                      { string: "UdM", name: "uomId", width: 50, minWidth: 50 },
                      {
                        string: "Recibido",
                        name: "receivedQty",
                        width: 30,
                        minWidth: 30,
                      },
                    ]}
                    renderRow={(row, index) => (
                      <tr key={row.id} className="border-bottom">
                        <SimpleTD
                          colIdx={index}
                          name="purchaseOperationProduct"
                        >
                          <FieldRelation
                            inline
                            model="productTemplate"
                            name={`OrderLines.${index}.productId`}
                            readonly
                          />
                        </SimpleTD>
                        <SimpleTD colIdx={index} name="purchaseOperationQty">
                          <FieldEntry
                            inline
                            type="number"
                            decimals={3}
                            name={`OrderLines.${index}.quantity`}
                            readonly
                          />
                        </SimpleTD>
                        <SimpleTD colIdx={index} name="lineUomId">
                          <FieldRelation
                            inline
                            model="uomCategory"
                            name={`OrderLines.${index}.uomId`}
                            readonly
                          />
                        </SimpleTD>
                        <SimpleTD colIdx={index} name="purchaseOperationQty">
                          <FieldEntry
                            inline
                            type="number"
                            decimals={3}
                            name={`OrderLines.${index}.receivedQty`}
                          />
                        </SimpleTD>
                      </tr>
                    )}
                  />
                </PageSheet>
              </Page>
            </Notebook>
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
