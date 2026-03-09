"use client";

import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { type UserWithProps } from "../actions/user-actions";
import { Badge } from "react-bootstrap";
import { formatDate } from "date-fns";
import ListView from "@/components/templates/ListView";
import { getByPath } from "@/app/libs/getByPath";
import { WidgetAvatar } from "@/components/templates/fields";

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
      render: (u) => (
        <div className="d-flex flex-row align-items-end gap-2">
          <span onClick={(e) => e.stopPropagation()}>
            <WidgetAvatar id={u.id} />
          </span>
          <span>{u.login}</span>
        </div>
      ),
    },
    {
      key: "Group.name",
      label: "Grupo",
      accessor: (u) => getByPath(u, "Group.name"),
      type: "string",
      filterable: true,
    },
    {
      key: "Partner.email",
      label: "Correo",
      accessor: (u) => getByPath(u, "Partner.email"),
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
      accessor: (u) =>
        u.lastLogin ? formatDate(u.lastLogin, "dd/MM/yyyy HH:mm") : null,
      render: (u) => (
        <div className="text-center">
          {u.lastLogin ? (
            formatDate(u.lastLogin, "dd/MM/yyyy HH:mm")
          ) : (
            <Badge bg="danger">Nunca</Badge>
          )}
        </div>
      ),
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
          domain={[["name", "!=", "bot"]]}
        />
      </ListView.Body>
    </ListView>
  );
}

export default UsersListView;
