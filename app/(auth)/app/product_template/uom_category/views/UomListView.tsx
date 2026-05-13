"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";
import { useRouter } from "next/navigation";
import { useState } from "react";

function UomListView() {
  const [active, setActive] = useState(true);

  const router = useRouter();
  return (
    <ListView model="uom_category">
      <ListView.Header
        title="Unidades de Medida"
        formView="/app/product_template/uom_category?view_type=form&id=null"
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
          model="uomCategory"
          baseDomain={[["active", "=", active]]}
          defaultOrder="name asc"
          pageSize={100}
          onRowClick={(row) =>
            router.push(
              `/app/product_template/uom_category?view_type=form&id=${row.id}`,
            )
          }
        >
          <Column field="name" label="Nombre" />
          <Column field="isBaseUnit" label="Base" type="boolean" />
          <Column field="ratio" label="Proporción" type="number" />
          <Column
            field="Products"
            label="Productos"
            type="relation"
            include={{ Products: { select: { id: true, name: true } } }}
            render={(_, r) => (
              <div className="text-end">{r.Products.length}</div>
            )}
          />
          <Column field="active" label="Activo" type="boolean" />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default UomListView;
