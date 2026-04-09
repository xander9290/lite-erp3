"use client";

import CardTemplate from "@/components/templates/CardTemplate";
import ListView from "@/components/templates/ListView";
import { useState } from "react";
import { USER_COLUMNS } from "./UsersListView";
import CardUser from "./CardUser";
import Link from "next/link";

function UsersKanbanView() {
  const [active, setActive] = useState(true);

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
          href="/app/users?view_type=list&id=null"
          className="btn btn-secondary btn-sm"
          title="Vista tabla"
        >
          <i className="bi-list-task"></i>
        </Link>
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
          domain={[["active", "=", active]]}
          includes={{
            Partner: true,
          }}
        />
      </ListView.Body>
    </ListView>
  );
}

export default UsersKanbanView;
