"use client";

import ListView from "@/components/templates/ListView";
import { useState } from "react";
import { WidgetCellRow, WidgetDropList } from "@/components/widgets";
import { TableTemplateLite } from "@/components/templates/table";
import { useRouter } from "next/navigation";
import { Column } from "@/components/templates/table/Column";

function ModelListView() {
  const [active, setActive] = useState(true);

  const router = useRouter();

  return (
    <ListView model="models">
      <ListView.Header
        title="Modelos"
        formView="/app/models?view_type=form&id=null"
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
          baseDomain={[["active", "=", active]]}
          defaultOrder="name asc"
          pageSize={100}
          model="model"
          onRowClick={(row) =>
            router.push(`/app/models?view_type=form&id=${row.id}`)
          }
        >
          <Column field="name" label="Nombre" type="string" />
          <Column
            field="ModelFields.name"
            label="Campos"
            type="relation"
            include={{ ModelFields: { select: { id: true, name: true } } }}
            render={(name, m) => (
              <WidgetCellRow>
                <WidgetDropList items={m.ModelFields} />
              </WidgetCellRow>
            )}
          />
          <Column
            field="active"
            label="Activo"
            type="boolean"
            sortable={false}
          />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default ModelListView;
