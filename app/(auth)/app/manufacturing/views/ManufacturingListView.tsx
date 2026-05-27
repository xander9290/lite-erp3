"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";
import { useRouter } from "next/navigation";
import { Badge } from "react-bootstrap";
import { manufacturingStatesDisplay } from "./ManufacturingFormView";
import { ManufacturingState } from "@/generated/prisma/enums";
import { useAuth } from "@/hooks/sessionStore";
import { formatDate } from "date-fns";

function ManufacturingListView() {
  const { companyId, company } = useAuth();
  const router = useRouter();
  return (
    <ListView model="manufacturing">
      <ListView.Header title={`Fabricación: ${company?.name}`} formView="/app/manufacturing?view_type=form&id=null" />
      <ListView.Body>
        <TableTemplateLite
          model="manufacturing"
          defaultOrder="name desc"
          pageSize={100}
          onRowClick={(row) => router.push(`/app/manufacturing?view_type=form&id=${row.id}`)}
          baseDomain={[["companyId", "=", companyId]]}
        >
          <Column field="name" label="Folio" />
          <Column field="date" label="Fecha" type="date" render={(value) => <div className="text-end">{formatDate(value, "dd/MM/yyyy")}</div>} />
          <Column field="Product.name" label="Producto" include={{ Product: { select: { id: true, name: true } }, Uom: { select: { name: true, code: true } } }} />
          <Column
            field="yield"
            label="Cantidad"
            type="number"
            render={(name, record) => (
              <div className="text-end">
                {name.toFixed(3)} {record.Uom.code}
              </div>
            )}
          />
          <Column
            field="state"
            label="Estado"
            render={(name) => {
              const outString = manufacturingStatesDisplay[name as ManufacturingState];
              let bg = "primary";
              if (outString === "En proceso") bg = "info";
              if (outString === "Finalizado") bg = "warning";
              if (outString === "Creado") bg = "success";
              if (outString === "Cancelado") bg = "danger";
              return (
                <div className="text-center">
                  <Badge bg={bg}>{outString}</Badge>
                </div>
              );
            }}
          />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default ManufacturingListView;
