"use client";

import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { UserWithProps } from "../actions/user-actions";
import { Badge } from "react-bootstrap";
import { formatDate } from "date-fns";
import ListView from "@/components/templates/ListView";
import { getByPath } from "@/app/libs/getByPath";

function UsersListView() {
  const columns: TableTemplateColumn<UserWithProps>[] = [
    {
      key: "Partner.name",
      label: "Nombre",
      accessor: (u) => u.Partner?.name,
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
      key: "Manager.name",
      label: "Gerente",
      accessor: (u) => getByPath(u, "Manager.name"),
      filterable: true,
      type: "string",
    },
    {
      key: "active",
      label: "Activo",
      accessor: (u) => (u.active ? "Sí" : "No"),
      render: (u) => (
        <div className="text-center">
          <Badge bg={u.active ? "success" : "danger"}>
            {u.active ? "Sí" : "No"}
          </Badge>
        </div>
      ),
    },
    {
      key: "lastLogin",
      label: "Última conexión",
      accessor: (u) => u.lastLogin,
      type: "date",
      render: (u) => {
        if (!u.lastLogin) {
          return <Badge bg="warning">Nunca</Badge>;
        }
        return formatDate(u.lastLogin, "dd/MM/yyyy hh:mm");
      },
      groupFormat: "dd/MM",
    },
  ];
  return (
    <ListView>
      <ListView.Header
        title="Usuarios"
        formView="/app/users?view_type=form&id=null"
      />
      <ListView.Body>
        <TableTemplate
          columns={columns}
          getRowId={(u) => u.id}
          model="user"
          viewForm="/app/users?view_type=form"
          pageSize={20}
          defaultOrder="name asc"
        />
      </ListView.Body>
    </ListView>
  );
}

export default UsersListView;
