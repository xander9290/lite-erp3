"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { GroupWithProps } from "../actions/groups-actions";

function GroupListView() {
  const columns: TableTemplateColumn<GroupWithProps>[] = [
    {
      key: "name",
      label: "Nombre",
      accessor: (g) => g.name,
      type: "string",
      filterable: true,
    },
  ];
  return (
    <ListView>
      <ListView.Header
        title="Grupos"
        formView="/app/groups?view_type=form&id=null"
      />
      <ListView.Body>
        <TableTemplate<GroupWithProps>
          columns={columns}
          getRowId={(g) => g.id}
          model="group"
          defaultOrder="name asc"
          viewForm="/app/groups?view_type=form"
        />
      </ListView.Body>
    </ListView>
  );
}

export default GroupListView;
