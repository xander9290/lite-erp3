"use client";

import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { ModelWithProps } from "../actions/model-actions";
import ListView from "@/components/templates/ListView";
import { Form } from "react-bootstrap";
import { useState } from "react";

function ModelListView() {
  const [active, setActive] = useState(true);

  const columns: TableTemplateColumn<ModelWithProps>[] = [
    {
      key: "name",
      label: "Nombre",
      fieldName: "name",
      accessor: (m) => m.name,
      filterable: true,
      type: "string",
    },
    {
      key: "label",
      label: "Etiqueta",
      fieldName: "label",
      accessor: (m) => m.label,
      filterable: true,
      type: "string",
    },
    {
      key: "description",
      label: "Descripción",
      fieldName: "description",
      accessor: (m) => m.description,
      filterable: true,
      type: "string",
    },
    {
      key: "ModelFields[].name",
      label: "Campos",
      fieldName: "fields",
      accessor: (m) => m.ModelFields?.map((u) => u.name).join(", ") ?? "",
      filterable: true,
      render: (m) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Form.Select size="sm" className="border-0">
            <option>{m.ModelFields?.length}</option>
            {m.ModelFields?.map((f, i) => (
              <option key={`field-${i}-${f.name}`} value={f.name}>
                {f.name}
              </option>
            ))}
          </Form.Select>
        </div>
      ),
    },
  ];
  return (
    <ListView model="models">
      <ListView.Header
        title="Modelos"
        formView="/app/models?view_type=form&id=null"
        actions={[
          {
            action: () => setActive(!active),
            name: "showActive",
            string: `${active ? "Inactivos" : "Activos"}`,
          },
        ]}
      />
      <ListView.Body>
        <TableTemplate<ModelWithProps>
          columns={columns}
          getRowId={(m) => m.id}
          model="model"
          defaultOrder="name asc"
          pageSize={50}
          viewForm="/app/models?view_type=form"
          domain={[["active", "=", active]]}
        />
      </ListView.Body>
    </ListView>
  );
}

export default ModelListView;
