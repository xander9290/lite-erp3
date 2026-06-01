"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";
import { useRouter } from "next/navigation";
import { useState } from "react";

function ITaxListView() {
  const [active, setActive] = useState(true);
  const router = useRouter();
  return (
    <ListView model="invoicingTax">
      <ListView.Header
        title="Impuestos"
        formView="/app/invoicing_settings/invoicing_tax?view_type=form&id=null"
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
          onRowClick={(row) => router.push(`/app/invoicing_settings/invoicing_tax?view_type=form&id=${row.id}`)}
          defaultOrder="name asc"
          model="invoicingTax"
          baseDomain={[["active", "=", active]]}
          pageSize={100}
        >
          <Column field="name" label="Nombre" />
          <Column field="description" label="Descripción" />
          <Column field="amount" label="Importe" type="number" />
          <Column field="typeUse" label="Tipo" />
          <Column field="active" label="Activo" type="boolean" />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default ITaxListView;
