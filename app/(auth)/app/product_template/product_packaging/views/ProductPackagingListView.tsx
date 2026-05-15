"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";
import { useRouter } from "next/navigation";
import { useState } from "react";

function ProductPackagingListView() {
  const router = useRouter();

  const [active, setActive] = useState(true);
  return (
    <ListView model="productPackaging">
      <ListView.Header
        title="Embalajes de producto"
        actions={[
          {
            action: () => setActive(!active),
            name: "showActive",
            string: `${active ? "Inactivos" : "Activos"}`,
          },
        ]}
        formView="/app/product_template/product_packaging?view_type=form&id=null"
      />
      <ListView.Body>
        <TableTemplateLite
          model="productPackaging"
          baseDomain={[["active", "=", active]]}
          pageSize={100}
          onRowClick={(row) => router.push(`/app/product_template/product_packaging?view_type=form&id=${row.id}`)}
          defaultOrder="name asc"
        >
          <Column field="name" label="Nombre" />
          <Column field="active" label="Activo" type="boolean" />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default ProductPackagingListView;
