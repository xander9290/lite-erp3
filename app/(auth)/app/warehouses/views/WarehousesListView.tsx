"use client";

import ListView from "@/components/templates/ListView";
import { useState } from "react";
import { WarehouseWithProps } from "../actions/warehouse-actions";
import { useAuth } from "@/hooks/sessionStore";
import { TableTemplateLite } from "@/components/templates/table";
import { useRouter } from "next/navigation";
import { Column } from "@/components/templates/table/Column";

function WarehousesListView() {
  const { companyId, companyCode } = useAuth();

  const [active, setActive] = useState(true);

  const router = useRouter();

  return (
    <ListView model="warehouses">
      <ListView.Header
        title={`Almacenes [${companyCode || "?"}]`}
        formView="/app/warehouses?view_type=form&id=null"
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
          pageSize={100}
          defaultOrder="name asc"
          model="warehouse"
          onRowClick={(row) =>
            router.push(`/app/warehouses?view_type=form&id=${row.id}`)
          }
          baseDomain={[
            ["active", "=", active],
            ["companyId", "=", companyId],
          ]}
        >
          <Column field="name" label="Nombre" type="string" />
          <Column
            field="Company.name"
            label="Empresa"
            include={{ Company: { select: { id: true, name: true } } }}
          />
          <Column field="active" label="Activo" type="boolean" />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default WarehousesListView;
