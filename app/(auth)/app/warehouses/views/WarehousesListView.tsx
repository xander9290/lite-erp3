"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { useState } from "react";
import { WarehouseWithProps } from "../actions/warehouse-actions";
import { useAuth } from "@/hooks/sessionStore";

const WAREHOUSE_COLUMNS: TableTemplateColumn<WarehouseWithProps>[] = [
  {
    key: "name",
    label: "Nombre",
    accessor: (w) => w.name,
    type: "string",
  },
  {
    key: "Company.name",
    label: "Empresa",
    accessor: (w) => w.Company.name,
    type: "string",
  },
];

function WarehousesListView() {
  const { companyId, companyCode } = useAuth();

  const [active, setActive] = useState(true);

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
        <TableTemplate
          viewForm="/app/warehouses?view_type=form"
          domain={[
            ["active", "=", active],
            ["companyId", "=", companyId],
          ]}
          columns={WAREHOUSE_COLUMNS}
          defaultOrder="name asc"
          getRowId={(w) => w.id}
          model="warehouse"
          pageSize={50}
        />
      </ListView.Body>
    </ListView>
  );
}

export default WarehousesListView;
