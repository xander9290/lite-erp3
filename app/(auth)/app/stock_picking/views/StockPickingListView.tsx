"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";
import {
  WidgetBadgeStatus,
  WidgetDeadline,
  WidgetDisplayDate,
} from "@/components/widgets";
import { useAuth } from "@/hooks/sessionStore";
import { useRouter } from "next/navigation";

function StockPickingListView() {
  const { company } = useAuth();

  const router = useRouter();

  return (
    <ListView model="stockPicking">
      <ListView.Header
        title={`Operaciones almacén ${company?.name}`}
        formView="/app/stock_picking?view_type=form&id=null"
      />
      <ListView.Body>
        <TableTemplateLite
          pageSize={100}
          onRowClick={(row) =>
            router.push(`/app/stock_picking?view_type=form&id=${row.id}`)
          }
          defaultOrder="name desc"
          model="stockPicking"
          baseDomain={[
            ["companyId", "=", company?.id],
            ["companyDestId", "=", company?.id],
          ]}
        >
          <Column
            field="name"
            label="Folio"
            render={(field) => <span className="fw-semibold">{field}</span>}
          />
          <Column
            field="date"
            label="Fecha"
            type="date"
            render={(field) => <WidgetDisplayDate date={field} />}
          />
          <Column
            field="operationType"
            label="Tipo"
            render={(field) => (
              <WidgetBadgeStatus
                value={field}
                options={{
                  internal: { label: "INTERNO", color: "none" },
                  outgoing: { label: "ENTREGA", color: "none" },
                  incoming: { label: "ENTRADA", color: "none" },
                }}
              />
            )}
          />
          <Column
            field="Partner.name"
            label="Contacto"
            include={{
              Partner: {
                select: {
                  id: true,
                  name: true,
                  Company: { select: { id: true } },
                },
              },
            }}
          />
          <Column field="reference" label="Reference" />
          <Column
            field="Warehouse.description"
            label="Origen"
            include={{
              Warehouse: {
                select: {
                  id: true,
                  description: true,
                  Company: { select: { id: true } },
                },
              },
            }}
          />
          <Column
            field="WarehouseDest.description"
            label="Destino"
            include={{
              WarehouseDest: {
                select: {
                  id: true,
                  description: true,
                },
              },
            }}
          />
          <Column
            field="datePlanned"
            label="Fecha de entrega"
            type="date"
            render={(field) => <WidgetDeadline date={field} warnAfter={1} />}
          />
          <Column
            field="state"
            label="Estado"
            render={(field) => (
              <WidgetBadgeStatus
                value={field}
                options={{
                  draft: { label: "Borrador", color: "secondary" },
                  confirmed: { label: "Confirmado", color: "primary" },
                  ready: { label: "Listo", color: "info" },
                  done: { label: "Hecho", color: "success" },
                  cancel: { label: "Cancelado", color: "danger" },
                }}
              />
            )}
          />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default StockPickingListView;
