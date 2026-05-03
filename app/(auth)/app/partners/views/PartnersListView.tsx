"use client";

import { CardTemplateLite } from "@/components/templates/CardTemplateLite";
import type { PartnerDisplayType } from "@/generated/prisma/enums";
import { Column } from "@/components/templates/table/Column";
import ListView from "@/components/templates/ListView";
import CardPartner from "./CardPartner";
import { useState } from "react";

type partnersDisplayTypes = Record<PartnerDisplayType, string>;

export const partnerTypes: partnersDisplayTypes = {
  SUPPLIER: "PROVEEDORES",
  CUSTOMER: "CLIENTES",
  INTERNAL: "INTERNOS",
  DELIVERY: "ENTREGA",
  CONTACT: "CONTACTO",
};

function PartnersListView({ display }: { display: string }) {
  const [active, setActive] = useState(true);

  return (
    <ListView model="partners">
      <ListView.Header
        title={`${partnerTypes[display as PartnerDisplayType]}`}
        formView={`/app/partners?view_type=form&id=null&display=${display}`}
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
          viewForm={`/app/partners?view_type=form&display=${display}`}
          emptyMessage="NO HAY REGISTROS"
          defaultOrder="name asc"
          pageSize={100}
          model="partner"
          baseDomain={[
            ["displayType", "=", display],
            ["active", "=", active],
          ]}
          renderCard={(row) => <CardPartner p={row} />}
        >
          <Column field="name" label="Nombre" />
          <Column
            field="imageUrl"
            label="Avatar"
            sortable={false}
            filterable={false}
          />
          <Column field="displayType" label="Tipo" type="string" />
          <Column field="active" label="Active" type="boolean" />
        </CardTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default PartnersListView;
