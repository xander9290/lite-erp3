"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { GroupWithProps } from "../actions/groups-actions";
import { formatDate } from "date-fns";
import { useState } from "react";
import { WidgetCellRow, WidgetDropList } from "@/components/widgets";

function GroupListView() {
  const [active, setActive] = useState(true);

  const columns: TableTemplateColumn<GroupWithProps>[] = [
    {
      key: "name",
      label: "Nombre",
      fieldName: "name",
      accessor: (g) => g.name,
      type: "string",
      filterable: true,
    },
    {
      key: "Users[].name",
      label: "Usuarios",
      fieldName: "users",
      accessor: (g) => g.Users?.map((u) => u.name).join(", ") ?? "",
      render: (g) => (
        <WidgetCellRow>
          <WidgetDropList items={g.Users} />
        </WidgetCellRow>
      ),
      filterable: true,
    },
    {
      key: "GroupLines[].fieldName",
      label: "Campos",
      fieldName: "lines",
      accessor: (g) =>
        g.GroupLines?.map((line) => line.fieldName).join(", ") ?? "",
      render: (g) => (
        <WidgetCellRow>
          <WidgetDropList
            items={g.GroupLines.map((l) => ({ id: l.id, name: l.fieldName }))}
          />
        </WidgetCellRow>
      ),
      filterable: true,
    },
    {
      key: "createdAt",
      label: "Creación",
      fieldName: "createdAt",
      accessor: (g) =>
        g.createdAt ? formatDate(g.createdAt, "dd/MM/yyyy HH:mm") : null,
      type: "datetime",
      groupFormat: "dd/MM",
    },
  ];
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
        <TableTemplate<GroupWithProps>
          columns={columns}
          getRowId={(g) => g.id}
          model="group"
          defaultOrder="name asc"
          viewForm="/app/groups?view_type=form"
          domain={[["active", "=", active]]}
        />
      </ListView.Body>
    </ListView>
  );
}

export default GroupListView;
