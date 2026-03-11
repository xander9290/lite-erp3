"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { GroupWithProps } from "../actions/groups-actions";
import { formatDate } from "date-fns";
import { Form } from "react-bootstrap";

function GroupListView() {
  const columns: TableTemplateColumn<GroupWithProps>[] = [
    {
      key: "name",
      label: "Nombre",
      accessor: (g) => g.name,
      type: "string",
      filterable: true,
    },
    {
      key: "Users[].name",
      label: "Usuarios",
      accessor: (g) => g.Users?.map((u) => u.name).join(", ") ?? "",
      render: (g) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Form.Select size="sm" className="border-0">
            <option>{g.Users?.length}</option>
            {g.Users?.map((u) => (
              <option key={u.id || Date.now()} value={u.id}>
                {u.name}
              </option>
            ))}
          </Form.Select>
        </div>
      ),
      filterable: true,
    },
    {
      key: "createdAt",
      label: "Creación",
      accessor: (g) =>
        g.createdAt ? formatDate(g.createdAt, "dd/MM/yyyy HH:mm") : null,
      type: "date",
      groupFormat: "dd/MM",
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
