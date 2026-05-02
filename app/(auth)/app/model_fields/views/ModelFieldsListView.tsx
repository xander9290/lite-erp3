"use client";

import ListView from "@/components/templates/ListView";
import { deleteModelFields } from "../actions/fields-actions";
import { useState } from "react";
import { useModals } from "@/contexts/ModalContext";
import toast from "react-hot-toast";
import { TableTemplateLite } from "@/components/templates/table";
import { useRouter } from "next/navigation";
import { Column } from "@/components/templates/table/Column";

function ModelFieldsListView() {
  const [selectedIds, setSelectedIds] = useState<Array<string>>([]);
  const [active, setActive] = useState(true);

  const { modalError, modalConfirm } = useModals();

  const router = useRouter();

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
        <TableTemplateLite
          model="modelField"
          baseDomain={[["active", "=", active]]}
          pageSize={100}
          defaultOrder="name asc"
          onRowClick={(row) =>
            router.push(`/app/model_fields?view_type=form&id=${row.id}`)
          }
          onSelectionChange={setSelectedIds}
        >
          <Column field="name" label="Nombre" type="string" />
          <Column
            field="Model.name"
            label="Modelo"
            include={{ Model: { select: { id: true, name: true } } }}
          />
          <Column field="active" label="Activo" type="boolean" />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default ModelFieldsListView;
