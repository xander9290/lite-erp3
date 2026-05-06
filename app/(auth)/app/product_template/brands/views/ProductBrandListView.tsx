"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";
import { useRouter } from "next/navigation";
import { useState } from "react";

function ProductBrandListView() {
  const router = useRouter();

  const [active, setActive] = useState(true);

  return (
    <ListView model="productBrand">
      <ListView.Header
        title="Marcas de producto"
        formView="/app/product_template/brands?view_type=form&id=null"
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
          model="productBrand"
          baseDomain={[["active", "=", active]]}
          defaultOrder="name asc"
          pageSize={100}
          onRowClick={(row) =>
            router.push(
              `/app/product_template/brands?view_type=form&id=${row.id}`,
            )
          }
        >
          <Column field="name" label="Nombre" />
          <Column field="code" label="Código" />
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

export default ProductBrandListView;
