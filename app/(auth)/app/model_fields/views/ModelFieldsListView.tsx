"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { ModelFieldWithProps } from "../actions/fields-actions";

function ModelFieldsListView() {
  const columns: TableTemplateColumn<ModelFieldWithProps>[] = [
    {
      key: "name",
      label: "Nombre",
      accessor: (f) => f.name,
      type: "string",
      filterable: true,
    },
    {
      key: "description",
      label: "Descripción",
      accessor: (f) => f.description,
      type: "string",
      filterable: true,
    },
    {
      key: "Model.name",
      label: "Modelo",
      accessor: (f) => f.Model?.name,
      type: "string",
      filterable: true,
    },
  ];
  return (
    <ListView model="modelField">
      <ListView.Header
        title="Campos"
        formView="/app/model_fields?view_type=form&id=null"
      />
      <ListView.Body>
        <TableTemplate
          columns={columns}
          getRowId={(r) => r.id}
          model="modelField"
          viewForm="/app/model_fields?view_type=form"
        />
      </ListView.Body>
    </ListView>
  );
}

export default ModelFieldsListView;
