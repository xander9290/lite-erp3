"use client";

import { TableTemplateColumn } from "@/components/templates/TableTemplate";
import { type UserWithProps } from "../actions/user-actions";
import { formatDate } from "date-fns";
import ListView from "@/components/templates/ListView";
import { getByPath } from "@/app/libs/getByPath";
import { useState } from "react";
import CardTemplate from "@/components/templates/CardTemplate";
import CardUser from "./CardUser";

export const USER_COLUMNS: TableTemplateColumn<UserWithProps>[] = [
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
    filterable: true,
  },
  {
    key: "active",
    label: "Activo",
    fieldName: "active",
    accessor: (u) => (u.active ? "Sí" : "No"),
  },
  {
    key: "lastLogin",
    label: "Última conexión",
    fieldName: "lastLogin",
    type: "datetime",
    accessor: (u) =>
      u.lastLogin ? formatDate(u.lastLogin, "dd/MM/yyyy HH:mm") : null,
  },
];

function UsersListView() {
  const [active, setActive] = useState(true);
  // const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");

  // const updateGroup = async ({
  //   id,
  //   newGroup,
  // }: {
  //   id: string | null;
  //   newGroup: string;
  // }) => {
  //   console.log(id, newGroup);
  // };

  return (
    <ListView model="users">
      <ListView.Header
        title="Usuarios"
        formView="/app/users?view_type=form&id=null"
        actions={[
          {
            action: () => setActive(!active),
            name: "showActive",
            string: `${active ? "Inactivos" : "Activos"}`,
          },
        ]}
      >
        {/* <Button
          size="sm"
          variant="secondary"
          title="Vista Kanban"
          onClick={() => setViewMode(viewMode === "list" ? "kanban" : "list")}
        >
          {viewMode === "list" ? (
            <i className="bi bi-kanban"></i>
          ) : (
            <i className="bi bi-list-task"></i>
          )}
        </Button> */}
      </ListView.Header>
      <ListView.Body>
        <CardTemplate
          columns={USER_COLUMNS}
          getRowId={(u) => u.id}
          model="user"
          viewForm="/app/users?view_type=form"
          pageSize={50}
          columnsGrid={4}
          defaultOrder="name"
          renderCard={(user) => <CardUser user={user} />}
          domain={[
            ["name", "!=", "bot"],
            ["active", "=", active],
          ]}
          includes={{
            Partner: true,
          }}
        />
      </ListView.Body>
    </ListView>
  );
}

export default UsersListView;
