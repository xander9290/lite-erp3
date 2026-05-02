"use client";

import ListView from "@/components/templates/ListView";
import { useState } from "react";
import { CardTemplateLite } from "@/components/templates/CardTemplateLite";
import CardCompany from "./CardCompany";
import { Column } from "@/components/templates/table/Column";

function CompaniesListView() {
  const [active, setActive] = useState(true);

  return (
    <ListView model="companies">
      <ListView.Header
        title="Empresas"
        formView="/app/companies?view_type=form&id=null"
        actions={[
          {
            action: () => setActive(!active),
            name: "showActive",
            string: `${active ? "Inactivos" : "Activos"}`,
          },
        ]}
      />
      <ListView.Body>
        <CardTemplateLite
          renderCard={(c) => <CardCompany comapny={c} />}
          viewForm="/app/companies?view_type=form"
          baseDomain={[["active", "=", active]]}
          defaultOrder="createdAt asc"
          model="company"
          pageSize={50}
        >
          <Column
            field="active"
            label="Activo"
            type="boolean"
            filterable={false}
          />
          <Column
            field="Partner.name"
            label="Nombre"
            include={{
              Partner: {
                select: { id: true, name: true, county: true, province: true },
              },
            }}
          />
          <Column
            field="Manager.name"
            label="Gerente"
            include={{
              Manager: {
                select: { id: true, name: true },
              },
            }}
          />
        </CardTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default CompaniesListView;
