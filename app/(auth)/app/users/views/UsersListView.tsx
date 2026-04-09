"use client";

import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { type UserWithProps } from "../actions/user-actions";
import { formatDate } from "date-fns";
import ListView from "@/components/templates/ListView";
import { getByPath } from "@/app/libs/getByPath";
import { useState } from "react";
import Link from "next/link";
import {
  WidgetAvatar,
  WidgetBadgeStatus,
  WidgetCellRow,
  WidgetDropList,
} from "@/components/widgets";

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
    render: (u) => (
      <WidgetCellRow>
        <WidgetAvatar imageUrl={u.Partner?.imageUrl} />
        <span>{u.Partner?.name}</span>
      </WidgetCellRow>
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
    filterable: true,
    render: (u) => (
      <WidgetCellRow>
        <WidgetDropList items={u.Companies} />
      </WidgetCellRow>
    ),
  },
  {
    key: "active",
    label: "Activo",
    fieldName: "active",
    type: "boolean",
    accessor: (u) => (u.active ? "Sí" : "No"),
    render: (u) => (
      <WidgetCellRow content="center">
        <WidgetBadgeStatus
          value={u.active ? "active" : "inactive"}
          options={{
            active: { label: "Activo", color: "success" },
            inactive: { label: "Inactivo", color: "danger" },
          }}
        />
      </WidgetCellRow>
    ),
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
        <Link
          href="/app/users?view_type=kanban&id=null"
          className="btn btn-secondary btn-sm"
          title="Vista kanban"
        >
          <i className="bi bi-table"></i>
        </Link>
      </ListView.Header>
      <ListView.Body>
        <TableTemplate
          columns={USER_COLUMNS}
          getRowId={(u) => u.id}
          pageSize={50}
          model="user"
          viewForm="/app/users?view_type=form"
          domain={[["active", "=", active]]}
          includes={{
            Partner: true,
          }}
        />
      </ListView.Body>
    </ListView>
  );
}

export default UsersListView;
