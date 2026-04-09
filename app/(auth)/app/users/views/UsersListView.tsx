"use client";

import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { type UserWithProps } from "../actions/user-actions";
import { Badge, Button, Card } from "react-bootstrap";
import { formatDate } from "date-fns";
import ListView from "@/components/templates/ListView";
import { getByPath } from "@/app/libs/getByPath";
import { useState } from "react";
import {
  WidgetAvatar,
  WidgetBadgeStatus,
  WidgetCellRow,
  WidgetDropList,
} from "@/components/widgets";
import CardTemplate from "@/components/templates/CardTemplate";

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
      <WidgetCellRow>
        <WidgetDropList items={g.Companies} />
      </WidgetCellRow>
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
        <WidgetBadgeStatus
          value={u.active ? "active" : "inactive"}
          options={{
            active: { label: "Activo", color: "success" },
            inactive: { label: "Inactivo", color: "danger" },
          }}
        />
      </div>
    ),
  },
  {
    key: "lastLogin",
    label: "Última conexión",
    fieldName: "lastLogin",
    type: "datetime",
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

function UsersListView() {
  const [active, setActive] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");

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
        <Button
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
        </Button>
      </ListView.Header>
      <ListView.Body>
        {viewMode === "list" ? (
          <TableTemplate
            columns={USER_COLUMNS}
            getRowId={(u) => u.id}
            model="user"
            viewForm="/app/users?view_type=form"
            pageSize={20}
            defaultOrder="name asc"
            domain={[
              ["name", "!=", "bot"],
              ["active", "=", active],
            ]}
            includes={{
              Partner: true,
            }}
          />
        ) : (
          <CardTemplate
            columns={USER_COLUMNS}
            getRowId={(u) => u.id}
            model="user"
            viewForm="/app/users?view_type=form"
            pageSize={50}
            columnsGrid={3}
            renderCard={(user) => (
              <Card>
                <Card.Body className="p-1">
                  <div>
                    <small className="d-flex flex-row align-items-end justify-content-between gap-2">
                      <WidgetAvatar
                        width={50}
                        height={50}
                        imageUrl={user.Partner?.imageUrl}
                      />
                      <strong>{user.Partner?.name}</strong>
                      <WidgetBadgeStatus
                        value={user.active ? "active" : "inactive"}
                        options={{
                          active: { label: "Activo", color: "success" },
                          inactive: { label: "Inactivo", color: "danger" },
                        }}
                      />
                    </small>
                  </div>
                  <div>
                    <p>{user.Partner?.email}</p>
                  </div>
                </Card.Body>
              </Card>
            )}
            domain={[
              ["name", "!=", "bot"],
              ["active", "=", active],
            ]}
            includes={{
              Partner: true,
            }}
          />
        )}
      </ListView.Body>
    </ListView>
  );
}

export default UsersListView;
