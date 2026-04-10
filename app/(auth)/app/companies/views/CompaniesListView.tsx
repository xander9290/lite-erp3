"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateColumn } from "@/components/templates/TableTemplate";
import { CompanieWithProps } from "../actions/companies-actions";
import { Form } from "react-bootstrap";
import { useState } from "react";
import { WidgetAvatar } from "@/components/widgets";
import CardTemplate from "@/components/templates/CardTemplate";
import CardCompany from "./CardCompany";

const columns: TableTemplateColumn<CompanieWithProps>[] = [
  {
    key: "name",
    label: "Nombre",
    accessor: (r) => `[${r.code}] ${r.name}`,
    type: "string",
    filterable: true,
    fieldName: "name",
    render: (u) => (
      <div className="d-flex flex-row align-items-end gap-2">
        <span onClick={(e) => e.stopPropagation()}>
          <WidgetAvatar imageUrl={u.Partner?.imageUrl} />
        </span>
        <span>{`[${u.code}] ${u.name}`}</span>
      </div>
    ),
  },
  {
    key: "Manager.name",
    label: "Gerente",
    accessor: (r) => r.Manager?.name,
    type: "string",
    filterable: true,
    fieldName: "managerId",
  },
  {
    key: "Users[].name",
    label: "Usuarios",
    fieldName: "users",
    accessor: (g) => g.Users?.map((u) => u.name).join(", ") ?? "",
    render: (g) => (
      <div onClick={(e) => e.stopPropagation()}>
        <Form.Select size="sm" className="border-0">
          <option>{g.Users?.length}</option>
          {g.Users?.map((u, i) => (
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
    key: "Company.name",
    label: "Matriz",
    accessor: (r) => r.Company?.name,
    type: "string",
    fieldName: "parentId",
  },
];

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
        {/* <TableTemplate
          columns={columns}
          getRowId={(r) => r.id}
          model="company"
          defaultOrder="name asc"
          pageSize={50}
          viewForm="/app/companies?view_type=form"
          includes={{ code: true, Partner: true }}
          domain={[["active", "=", active]]}
        /> */}
        <CardTemplate
          includes={{ code: true, Partner: true, Children: true }}
          renderCard={(c) => <CardCompany comapny={c} />}
          viewForm="/app/companies?view_type=form"
          domain={[["active", "=", active]]}
          defaultOrder="createdAt asc"
          getRowId={(c) => c.id}
          columns={columns}
          model="company"
          pageSize={50}
        />
      </ListView.Body>
    </ListView>
  );
}

export default CompaniesListView;
