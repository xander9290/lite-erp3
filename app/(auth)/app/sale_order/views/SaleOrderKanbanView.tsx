"use client";

import { CardTemplateLite } from "@/components/templates/CardTemplateLite";
import ListView from "@/components/templates/ListView";
import Link from "next/link";
import SaleOrderCard from "./SaleOrderCard";
import { Column } from "@/components/templates/table/Column";
import { useAuth } from "@/hooks/sessionStore";
import { SaleOrderWithProps } from "../actions/saleOrder.action";

function SaleOrderKanbanView({ state }: { state: string }) {
  const { companyId } = useAuth();

  return (
    <ListView model="saleOrder">
      <ListView.Header
        title={`${state === "draft" ? "Ventas cotizaciones" : "Órdenes de venta"}`}
        formView="/app/sale_order?view_type=form&id=null"
      >
        <Link
          href="/app/sale_order?view_type=list&id=null"
          className="btn btn-info"
          title="Vista tabla"
        >
          <i className="bi-list-task"></i>
        </Link>
      </ListView.Header>
      <ListView.Body>
        <CardTemplateLite
          model="saleOrder"
          defaultOrder={`${state !== "draf" ? "confirmedDate asc" : "name desc"}`}
          viewForm="/app/sale_order?view_type=form"
          renderCard={(order) => (
            <SaleOrderCard order={order as SaleOrderWithProps} />
          )}
          baseDomain={[
            ["state", "=", "sale"],
            ["companyId", "=", companyId],
          ]}
        >
          <Column field="name" label="Nombre" />
          <Column field="orderDate" label="Fecha" type="date" />
          <Column
            field="Partner.name"
            label="Cliente"
            include={{ Partner: { select: { id: true, name: true } } }}
          />
          <Column
            field="ShippingWay.name"
            label="Forma de envío"
            include={{ ShippingWay: { select: { id: true, name: true } } }}
          />
          <Column field="total" label="Total" type="number" />
        </CardTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default SaleOrderKanbanView;
