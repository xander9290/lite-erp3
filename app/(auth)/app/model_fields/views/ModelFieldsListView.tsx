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
// import KanbanTemplate from "@/components/templates/KanbanTemplate";
// import CardField from "./CardField";

function ModelFieldsListView() {
  const [selectedIds, setSelectedIds] = useState<Array<string>>([]);
  const [active, setActive] = useState(true);

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
    {
      key: "active",
      label: "Activo",
      accessor: (f) => (f.active ? "Activo" : "Inactivo"),
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
          {
            action: () => setActive(!active),
            name: "showActive",
            string: `${active ? "Inactivos" : "Activos"}`,
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
          domain={[["active", "=", active]]}
        />
        {/* <KanbanTemplate
          columns={columns}
          model="modelField"
          getRowId={(m) => m.id}
          pageSize={50}
          groupBy="active"
          renderCard={(field) => <CardField field={field} />}
          viewForm="/app/model_fields?view_type=form"
          sortGroups={(state) => {
            const order = ["Activo", "Inactivo"];
            return order.filter((g) => state.includes(g));
          }}
          useInfiniteScroll
          infiniteScrollThreshold={10}
        /> */}
      </ListView.Body>
    </ListView>
  );
}

export default ModelFieldsListView;
