"use client";

import { formatNumberForDisplay } from "@/app/libs/helpers";
import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";
import { WidgetDeadline } from "@/components/widgets";
import { useAuth } from "@/hooks/sessionStore";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Alert } from "react-bootstrap";

const moveTypeDisplay: Record<string, string> = {
  incomming: "entrantes",
  outgoing: "salientes",
};

function StockPickingLineView({ productId, moveType }: { productId: string | null; moveType: string }) {
  const { company } = useAuth();

  if (company?.id === undefined) {
    return <Alert variant="warning">COMPANY NOT DEFINED</Alert>;
  }

  const domain = [["Picking.state", "notIn", ["done", "cancel"]]];

  if (productId) domain.push(["productId", "=", productId]);

  if (moveType === "incomming") {
    domain.push(["Picking.companyDestId", "=", company?.id]);
  } else if (moveType === "outgoing") {
    domain.push(["Picking.companyOriginId", "=", company?.id]);
  }

  return (
    <ListView model="stockPickingLine">
      <ListView.Header title={`Movimientos ${moveTypeDisplay[moveType]}`} />
      <ListView.Body>
        <TableTemplateLite pageSize={100} defaultOrder="createdAt asc" baseDomain={domain} model="stockPickingLine">
          <Column field="createdAt" label="Fecha de solicitud" type="datetime" render={(name) => format(name, "dd MMM yyyy HH:mm", { locale: es })} />
          <Column
            field="Picking.name"
            label="Referencia"
            include={{
              Picking: {
                select: {
                  id: true,
                  name: true,
                  datePlanned: true,
                  Warehouse: {
                    select: {
                      id: true,
                      description: true,
                    },
                  },
                  WarehouseDest: {
                    select: {
                      id: true,
                      description: true,
                    },
                  },
                },
              },
            }}
            render={(name, field) => <Link href={`/app/stock_picking?view_type=form&id=${field.Picking.id}`}>{name}</Link>}
          />
          <Column field="Product.name" label="Producto" include={{ Product: { select: { id: true, name: true } } }} />
          <Column field="Picking.Warehouse.description" label="Origen" />
          <Column field="Picking.WarehouseDest.description" label="Destino" />
          <Column field="delivered" label="Cantidad" type="number" render={(name) => <div className="text-end fw-semibold">{formatNumberForDisplay(name, 3)}</div>} />
          <Column field="Picking.datePlanned" label="Fecha programada" type="date" render={(name) => <WidgetDeadline date={name} warnAfter={2} />} />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default StockPickingLineView;
