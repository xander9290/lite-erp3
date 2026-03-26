"use client";

import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { type UserWithProps } from "../actions/user-actions";
import { Badge, Form } from "react-bootstrap";
import { formatDate } from "date-fns";
import ListView from "@/components/templates/ListView";
import { getByPath } from "@/app/libs/getByPath";
import { WidgetAvatar } from "@/components/templates/fields";

function UsersListView() {
  const columns: TableTemplateColumn<UserWithProps>[] = [
    {
      key: "name",
      label: "Nombre",
      fieldName: "name",
      accessor: (u) => u.Partner?.name,
      filterable: true,
      type: "string",
    },
    {
      key: "login",
      label: "Usuario",
      fieldName: "login",
      accessor: (u) => u.login,
      filterable: true,
      type: "string",
      render: (u) => (
        <div className="d-flex flex-row align-items-end gap-2">
          <span onClick={(e) => e.stopPropagation()}>
            <WidgetAvatar imageUrl={u.Partner?.imageUrl} />
          </span>
          <span>{u.login}</span>
        </div>
      ),
    },

    {
      key: "Partner.email",
      label: "Correo",
      fieldName: "email",
      accessor: (u) => getByPath(u, "Partner.email"),
      filterable: true,
      type: "string",
    },
    {
      key: "Group.name",
      label: "Grupo",
      fieldName: "groupId",
      accessor: (u) => getByPath(u, "Group.name"),
      type: "string",
      filterable: true,
    },
    {
      key: "Companies[].name",
      label: "Empresas",
      fieldName: "comapnies",
      accessor: (g) => g.Companies?.map((u) => u.name).join(", ") ?? "",
      render: (g) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Form.Select size="sm" className="border-0">
            <option>{g.Companies?.length}</option>
            {g.Companies?.map((u, i) => (
              <option key={`user-${i}-${u.name}`} value={u.name}>
                {u.name}
              </option>
            ))}
          </Form.Select>
        </div>
      ),
      filterable: true,
    },
    {
      key: "active",
      label: "Activo",
      fieldName: "active",
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
      fieldName: "lastLogin",
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
    <ListView model="users">
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
          includes={{
            Partner: true,
          }}
        />
      </ListView.Body>
    </ListView>
  );
}

export default UsersListView;
