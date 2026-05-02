"use client";

import ListView from "@/components/templates/ListView";
import { useState } from "react";
import CardUser from "./CardUser";
import Link from "next/link";
import { CardTemplateLite } from "@/components/templates/CardTemplateLite";
import { Column } from "@/components/templates/table/Column";

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
        <CardTemplateLite
          model="user"
          renderCard={(user) => <CardUser user={user} />}
          baseDomain={[["active", "=", active]]}
          viewForm="/app/users?view_type=form"
        >
          <Column field="active" label="Activo" type="boolean" />
          <Column
            field="Companies"
            label="Empresas"
            type="relation"
            include={{ Companies: { select: { id: true, name: true } } }}
          />
        </CardTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default UsersKanbanView;
