"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";
import { useRouter } from "next/navigation";
import { useState } from "react";

function IPaymentTermListView() {
  const [active, setActive] = useState(true);
  const router = useRouter();

  return (
    <ListView model="invoicingPaymentTerm">
      <ListView.Header
        title="Términos de pago"
        formView="/app/invoicing_settings/payment_term?view_type=form&id=null"
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
          onRowClick={(row) => router.push(`/app/invoicing_settings/payment_term?view_type=form&id=${row.id}`)}
          baseDomain={[["active", "=", active]]}
          pageSize={100}
          defaultOrder="name desc"
          model="invoicingPaymentTerm"
        >
          <Column field="name" label="Nombre" />
          <Column field="days" label="Días" type="number" />
          <Column field="active" label="Activo" type="boolean" />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default IPaymentTermListView;
