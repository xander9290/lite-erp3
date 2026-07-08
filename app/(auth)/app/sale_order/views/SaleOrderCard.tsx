"use client";

import { Card } from "react-bootstrap";
import { SaleOrderWithProps } from "../actions/saleOrder.action";
import { WidgetCurrency, WidgetDisplayDate, WidgetLiveRemaining } from "@/components/widgets";

function SaleOrderCard({ order }: { order: SaleOrderWithProps }) {
  return (
    <Card className="shadow-sm border-1 h-100 bg-body-tertiary">
      <Card.Body className="d-flex flex-column gap-3">
        {/* Encabezado */}
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="fw-semibold fs-6">{order.name}</div>
            <small className="text-body-secondary d-flex gap-2">
              <i className="bi bi-calendar3" />
              <WidgetDisplayDate date={order.orderDate} />
            </small>
          </div>

          <small className="text-end">
            <WidgetLiveRemaining date={order.confirmedDate} />
          </small>
        </div>

        {/* Datos */}
        <div className="small">
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-truck me-2 text-body-secondary" />
            <span>{order.ShippingWay.name}</span>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <div className="text-truncate me-3">
              <i className="bi bi-person me-2 text-body-secondary" />
              {order.Partner.name}
            </div>

            <small className="text-body-secondary">{order.reference || "—"}</small>
          </div>
        </div>

        {/* Total */}
        <div className="border-top pt-2 mt-auto d-flex justify-content-end">
          <span className="fw-bold fs-5">
            <WidgetCurrency number={order.total} />
          </span>
        </div>
      </Card.Body>
    </Card>
  );
}

export default SaleOrderCard;
