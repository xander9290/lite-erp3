"use client";

import ListView from "@/components/templates/ListView";
import { useState } from "react";
import { WidgetCellRow, WidgetDropList } from "@/components/widgets";
import { TableTemplateLite } from "@/components/templates/table";
import { useRouter } from "next/navigation";
import { Column } from "@/components/templates/table/Column";

function GroupListView() {
  const [active, setActive] = useState(true);

  const router = useRouter();

  return (
    <ListView model="groups">
      <ListView.Header
        title="Grupos"
        formView="/app/groups?view_type=form&id=null"
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
          model="group"
          defaultOrder="name asc"
          baseDomain={[["active", "=", active]]}
          onRowClick={(row) =>
            router.push(`/app/groups?view_type=form&id=${row.id}`)
          }
        >
          <Column field="name" label="Nombre" type="string" />
          <Column
            field="Users"
            label="Usuarios"
            type="relation"
            include={{ Users: { select: { id: true, name: true } } }}
            sortable={false}
            render={(_, g) => (
              <WidgetCellRow>
                <WidgetDropList items={g.Users} />
              </WidgetCellRow>
            )}
          />
          <Column field="active" label="Activo" type="boolean" />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default GroupListView;
