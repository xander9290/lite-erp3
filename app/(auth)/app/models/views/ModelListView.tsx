"use client";

import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { ModelWithProps } from "../actions/model-actions";
import ListView from "@/components/templates/ListView";
import { useState } from "react";
import { WidgetCellRow, WidgetDropList } from "@/components/widgets";

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
        <WidgetCellRow>
          <WidgetDropList items={m.ModelFields} />
        </WidgetCellRow>
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
          defaultOrder="createdAt asc"
          pageSize={50}
          viewForm="/app/models?view_type=form"
          domain={[["active", "=", active]]}
        />
      </ListView.Body>
    </ListView>
  );
}

export default ModelListView;
