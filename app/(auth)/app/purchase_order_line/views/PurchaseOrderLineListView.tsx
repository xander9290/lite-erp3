"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";
import { KeyboardEvent } from "react";
import { Form } from "react-bootstrap";
import { updatePOLineReceivedQty } from "../actions/purchaseOrderLine.action";
import { useModals } from "@/contexts/ModalContext";
import { toast } from "react-hot-toast";
import { mutate as swrMutate } from "swr";
import { parseMexicanNumber } from "@/components/templates/fields/FieldEntry";

function PurchaseOrderLineListView({ orderId }: { orderId: string | null }) {
  const { modalError } = useModals();

  const handleReceivedQty = async (
    event: KeyboardEvent<HTMLInputElement>,
    lineId: string,
  ) => {
    if (event.key === "Enter") {
      const value = Number(event.currentTarget.value);
      const res = await updatePOLineReceivedQty({ id: lineId, qty: value });
      if (!res.success) return modalError(res.message);
      swrMutate(
        (key) =>
          typeof key === "string" &&
          key.includes("/api/tables/purchaseOrderLine"),
      );

      toast.success(res.message);
    }
  };
  return (
    <ListView model="purchaseOrderLine">
      <ListView.Header title="Movimientos de la orden" />
      <ListView.Body>
        <TableTemplateLite
          baseDomain={[["orderId", "=", orderId]]}
          pageSize={100}
          defaultOrder="createdAt desc"
          model="purchaseOrderLine"
        >
          <Column
            field="Product.name"
            label="Producto"
            include={{ Product: { select: { id: true, name: true } } }}
          />
          <Column
            field="quantity"
            label="Ordenado"
            type="number"
            render={(name) => <div className="text-end">{name}</div>}
          />
          <Column
            field="Uom.code"
            label="UdM"
            include={{ Uom: { select: { id: true, code: true } } }}
          />
          <Column
            field="receivedQty"
            label="Recibido"
            type="number"
            render={(name, row) => (
              <div className="d-flex justify-content-end">
                <Form.Control
                  size="sm"
                  className="w-25 shadow-none border-0 bg-body-tertiary text-end"
                  type="number"
                  step="0.000"
                  min={0}
                  defaultValue={name}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                    handleReceivedQty(e, row.id)
                  }
                />
              </div>
            )}
          />
          <Column
            field="invoicedQty"
            label="Facturado"
            type="number"
            render={(name) => <div className="text-end">{name}</div>}
          />
          <Column field="state" label="Estado" />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default PurchaseOrderLineListView;
