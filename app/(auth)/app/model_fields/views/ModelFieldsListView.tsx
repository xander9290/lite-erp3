"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import {
  deleteModelFields,
  ModelFieldWithProps,
} from "../actions/fields-actions";
import { useState } from "react";
import { useModals } from "@/contexts/ModalContext";
import toast from "react-hot-toast";

function ModelFieldsListView() {
  const [selectedIds, setSelectedIds] = useState<Array<string>>([]);

  const { modalError, modalConfirm } = useModals();

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

  const handleDeleteRecord = () => {
    if (selectedIds.length < 1)
      return modalError("No hay registros seleccionados");

    modalConfirm("Confirma la accion", async () => {
      const res = await deleteModelFields({ ids: selectedIds });
      if (!res.success) return modalError(res.message);
      toast.success(res.message);
    });
  };

  return (
    <ListView model="modelField">
      <ListView.Header
        formView="/app/model_fields?view_type=form&id=null"
        title="Campos"
        actions={[
          {
            string: (
              <>
                <i className="bi bi-trash me-2"></i>
                <span>Eliminar</span>
              </>
            ),
            action: handleDeleteRecord,
            name: "deleteRecord",
          },
        ]}
      />
      <ListView.Body>
        <TableTemplate
          viewForm="/app/model_fields?view_type=form"
          getRowId={(r) => r.id}
          model="modelField"
          columns={columns}
          pageSize={20}
          onSelectionChange={setSelectedIds}
        />
      </ListView.Body>
    </ListView>
  );
}

export default ModelFieldsListView;
