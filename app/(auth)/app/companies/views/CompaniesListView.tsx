"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { CompanieWithProps } from "../actions/companies-actions";
import { Form } from "react-bootstrap";

function CompaniesListView() {
  const columns: TableTemplateColumn<CompanieWithProps>[] = [
    {
      key: "name",
      label: "Nombre",
      accessor: (r) => r.name,
      type: "string",
      filterable: true,
      fieldName: "name",
    },
    {
      key: "Manager.Partner.name",
      label: "Gerente",
      accessor: (r) => r.Manager?.Partner?.name,
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
  return (
    <ListView model="companies">
      <ListView.Header
        title="Empresas"
        formView="/app/companies?view_type=form&id=null"
      />
      <ListView.Body>
        <TableTemplate
          columns={columns}
          getRowId={(r) => r.id}
          model="company"
          defaultOrder="name asc"
          pageSize={50}
          viewForm="/app/companies?view_type=form"
        />
      </ListView.Body>
    </ListView>
  );
}

export default CompaniesListView;
