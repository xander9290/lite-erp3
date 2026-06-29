"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";
import { useRouter } from "next/navigation";
import { useState } from "react";

function ShippingWayListView() {
  const [active, setActive] = useState(true);
  const router = useRouter();

  return (
    <ListView model="saleShippingWay">
      <ListView.Header
        title="Formas de envío"
        formView="/app/sale_settings/sale_shipping_way?view_type=form&id=null"
        actions={[
          {
            action: () => setActive(!active),
            name: "showActive",
            string: `${active ? "Inactivos" : "Activos"}`,
          },
        ]}
      />
      <ListView.Body>
        <TableTemplateLite
          model="saleShippingWay"
          baseDomain={[["active", "=", active]]}
          pageSize={100}
          defaultOrder="name asc"
          onRowClick={(row) => router.push(`/app/sale_settings/sale_shipping_way?view_type=form&id=${row.id}`)}
        >
          <Column field="name" label="Nombre" />
          <Column field="type" label="Tipo" />
          <Column field="active" label="Activo" type="boolean" />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default ShippingWayListView;
