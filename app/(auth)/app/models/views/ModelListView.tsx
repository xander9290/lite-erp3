"use client";

import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { ModelWithProps } from "../actions/model-actions";
import ListView from "@/components/templates/ListView";
import { Form } from "react-bootstrap";

function ModelListView() {
  const columns: TableTemplateColumn<ModelWithProps>[] = [
    {
      key: "name",
      label: "Nombre",
      accessor: (m) => m.name,
      filterable: true,
      type: "string",
    },
    {
      key: "label",
      label: "Etiqueta",
      accessor: (m) => m.label,
      filterable: true,
      type: "string",
    },
    {
      key: "description",
      label: "Descripción",
      accessor: (m) => m.description,
      filterable: true,
      type: "string",
    },
    {
      key: "ModelFields[].name",
      label: "Campos",
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
      />
      <ListView.Body>
        <TableTemplate<ModelWithProps>
          columns={columns}
          getRowId={(m) => m.id}
          model="model"
          defaultOrder="name asc"
          pageSize={50}
          viewForm="/app/models?view_type=form"
        />
      </ListView.Body>
    </ListView>
  );
}

export default ModelListView;
