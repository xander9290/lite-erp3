"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";
import { useRouter } from "next/navigation";
import { useState } from "react";

function ICurrencyListView() {
  const [active, setActive] = useState(true);
  const router = useRouter();
  return (
    <ListView model="invoicingCurrency">
      <ListView.Header
        title="Monedas"
        formView="/app/invoicing_settings/invoicing_currency?view_type=form&id=null"
        actions={[
          {
            action: () => setActive(!active),
            name: "showActive",
            string: `${active ? "Inactivos" : "Activos"}`,
          },
        ]}
      />
      <TableTemplateLite
        model="invoicingCurrency"
        baseDomain={[["active", "=", active]]}
        pageSize={100}
        defaultOrder="name desc"
        onRowClick={(row) =>
          router.push(
            `/app/invoicing_settings/invoicing_currency?view_type=form&id=${row.id}`,
          )
        }
      >
        <Column field="name" label="Nombre" />
        <Column field="description" label="Descripción" />
        <Column field="active" label="Activo" type="boolean" />
      </TableTemplateLite>
    </ListView>
  );
}

export default ICurrencyListView;
