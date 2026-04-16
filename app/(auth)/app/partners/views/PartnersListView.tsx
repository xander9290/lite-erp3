"use client";

import CardTemplate from "@/components/templates/CardTemplate";
import ListView from "@/components/templates/ListView";
import { TableTemplateColumn } from "@/components/templates/TableTemplate";
import type { PartnerDisplayType } from "@/generated/prisma/enums";
import { useState } from "react";
import { PartnerWithProps } from "../actions/partner-actions";
import CardPartner from "./CardPartner";

type partnersDisplayTypes = Record<PartnerDisplayType, string>;

export const partnerTypes: partnersDisplayTypes = {
  SUPPLIER: "PROVEEDORES",
  CUSTOMER: "CLIENTES",
  INTERNAL: "INTERNOS",
  DELIVERY: "ENTREGA",
  CONTACT: "CONTACTO",
};

const PARTNER_COLUMNS: TableTemplateColumn<PartnerWithProps>[] = [
  {
    key: "name",
    label: "Nombre",
    accessor: (p) => p.name,
  },
  {
    key: "imageUrl",
    label: "Imagen",
    accessor: (p) => p.imageUrl,
  },
  {
    key: "street",
    label: "Calle",
    accessor: (p) => p.street,
  },
  {
    key: "street",
    label: "Entre calles",
    accessor: (p) => p.streets,
  },
  {
    key: "houseNumber",
    label: "Exterior",
    accessor: (p) => p.streets,
  },
  {
    key: "town",
    label: "Colonia",
    accessor: (p) => p.town,
  },
  {
    key: "county",
    label: "Municipio",
    accessor: (p) => p.county,
  },
  {
    key: "province",
    label: "Estado",
    accessor: (p) => p.province,
  },
  {
    key: "country",
    label: "País",
    accessor: (p) => p.country,
  },
  {
    key: "phone",
    label: "Teléfono",
    accessor: (p) => p.phone,
  },
  {
    key: "email",
    label: "Correo",
    accessor: (p) => p.email,
  },
];

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
        <CardTemplate
          columns={PARTNER_COLUMNS}
          model="partner"
          getRowId={(p) => p.id}
          renderCard={(p) => <CardPartner p={p} />}
          defaultOrder="name asc"
          emptyMessage="NO HAY REGISTROS"
          pageSize={50}
          domain={[
            ["displayType", "=", display],
            ["active", "=", active],
          ]}
          viewForm={`/app/partners?view_type=form&display=${display}`}
        />
      </ListView.Body>
    </ListView>
  );
}

export default PartnersListView;
