"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";
import { WidgetBadgeStatus } from "@/components/widgets";
import { useRouter } from "next/navigation";
import { useState } from "react";

function InvoicingJournalListView() {
  const [active, setActive] = useState(true);
  const router = useRouter();

  return (
    <ListView model="invoicingJournal">
      <ListView.Header
        title="Diarios"
        formView="/app/invoicing_settings/invoicing_journal?view_type=form&id=null"
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
          onRowClick={(row) =>
            router.push(
              `/app/invoicing_settings/invoicing_journal?view_type=form&id=${row.id}`,
            )
          }
          defaultOrder="name asc"
          baseDomain={["active", "=", active]}
          model="invoicingJournal"
          pageSize={100}
        >
          <Column field="name" label="Nombre" />
          <Column
            field="type"
            label="Tipo"
            render={(name) => (
              <WidgetBadgeStatus
                value={name}
                options={{
                  bank: { label: "Banco", color: "none" },
                  sale: { label: "Ventas", color: "none" },
                  cash: { label: "Efectivo", color: "none" },
                  general: { label: "Varios", color: "none" },
                  purchase: { label: "Compras", color: "none" },
                }}
              />
            )}
          />
          <Column field="code" label="Código" />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default InvoicingJournalListView;
