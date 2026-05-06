"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";
import { useRouter } from "next/navigation";
import { useState } from "react";

function ProductCategoryListView() {
  const [active, setActive] = useState(true);

  const router = useRouter();
  return (
    <ListView model="productCategory">
      <ListView.Header
        title="Categorías de producto"
        formView="/app/product_template/categories?view_type=form&id=null"
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
          model="productCategory"
          baseDomain={[["active", "=", active]]}
          defaultOrder="name asc"
          pageSize={100}
          onRowClick={(row) =>
            router.push(
              `/app/product_template/categories?view_type=form&id=${row.id}`,
            )
          }
        >
          <Column field="name" label="Nombre" />
          <Column
            field="Products"
            label="Productos"
            type="relation"
            include={{ Products: { select: { id: true, name: true } } }}
            render={(_, r) => (
              <div className="text-end">{r.Products.length}</div>
            )}
          />
          <Column
            field="Parent.name"
            label="Principal"
            include={{ Parent: { select: { id: true, name: true } } }}
          />
          <Column field="active" label="Activo" type="boolean" />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default ProductCategoryListView;
