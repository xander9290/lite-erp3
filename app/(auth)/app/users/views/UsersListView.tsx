"use client";

import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { UserWithProps } from "../actions/actions";
import { getByPath } from "@/app/libs/getByPath";
import { formatDate } from "date-fns";
import { Badge } from "react-bootstrap";

function UsersListView() {
  const columns: TableTemplateColumn<UserWithProps>[] = [
    {
      key: "Partner.name",
      label: "Nombre",
      accessor: (u) => getByPath(u, "Partner.name"),
      filterable: true,
      type: "string",
    },
    {
      key: "login",
      label: "Usuario",
      accessor: (u) => u.login,
      filterable: true,
      type: "string",
    },
    {
      key: "Partner.email",
      label: "Correo",
      accessor: (u) => getByPath(u, "Partner.email"),
      filterable: true,
      type: "string",
    },
    {
      key: "lastLogin",
      label: "Última conexión",
      accessor: (u) => u.lastLogin,
      render: (u) => (
        <div className="text-center">
          {u.lastLogin ? (
            formatDate(u.lastLogin, "dd/MM/yyyy HH:mm")
          ) : (
            <Badge bg="warning">No conectado</Badge>
          )}
        </div>
      ),
      type: "date",
      groupFormat: "dd/mm",
    },
  ];
  return (
    <TableTemplate<UserWithProps>
      columns={columns}
      model="user"
      getRowId={(u) => u.id}
      pageSize={80}
      viewForm="/app/users?view_type=form"
    />
  );
}

export default UsersListView;
