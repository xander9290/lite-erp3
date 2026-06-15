"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";
import { useRouter } from "next/navigation";
import { PurchaseOrderSchemaType } from "../schemas/purchase.schema";
import { Badge } from "react-bootstrap";
import { WidgetAvatar, WidgetCurrency, WidgetDeadline, WidgetDisplayDate } from "@/components/widgets";
import { useAuth } from "@/hooks/sessionStore";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const purchaseOrderStateDisplay: Record<PurchaseOrderSchemaType["state"], string> = {
  draft: "Cotización",
  purchase: "Compra",
  pending: "Incompleto",
  done: "Hecho",
  cancel: "Cancelado",
};

function PurchaseListView({ state }: { state: string | null }) {
  const { companyId } = useAuth();

  const domain: any[] = [["WarehouseDest.companyId", "=", companyId]];
  if (state === "draft") {
    domain.push(["state", "in", ["draft", "cancel"]]);
  } else {
    domain.push(["state", "in", ["purchase", "done", "pending"]]);
  }

  const router = useRouter();

  return (
    <ListView model="purchaseOrder">
      <ListView.Header title="Compras" formView="/app/purchase_order?view_type=form&id=null" />
      <ListView.Body>
        <TableTemplateLite
          model="purchaseOrder"
          defaultOrder="name desc"
          pageSize={100}
          baseDomain={domain}
          onRowClick={(row) => router.push(`/app/purchase_order?view_type=form&id=${row.id}`)}
          showTotals={true}
          totalColumns={["total"]}
        >
          <Column field="name" label="Folio" render={(name) => <div className="fw-bold">{name}</div>} />
          <Column field="date" label="Creación" type="date" render={(name) => <WidgetDisplayDate date={name} />} />
          <Column
            field="Supplier.name"
            label="Proveedor"
            include={{
              Supplier: { select: { name: true, id: true, imageUrl: true } },
            }}
            render={(_, field) => <WidgetAvatar imageUrl={field.Supplier.imageUrl} displayName={field.Supplier.name} />}
          />
          <Column
            field="dateOrder"
            label="Confirmar el"
            type="date"
            render={(name, row) => {
              if (row.state === "cancel") {
                return null;
              }
              return row.state === "draft" ? (
                <WidgetDeadline date={name} warnAfter={3} />
              ) : (
                <div className="text-center">
                  {format(row.confirmedDate, "dd MMM yyyy HH:mm:ss", { locale: es })}
                  <i className="bi bi-check-circle-fill text-success ms-2"></i>
                </div>
              );
            }}
          />
          <Column
            field="datePlanned"
            label="LLega el"
            type="date"
            render={(name, row) => {
              if (row.state === "cancel") {
                return null;
              }
              return row.state !== "purchase" ? (
                <div className="text-center">
                  {!row.doneDate ? (
                    <>
                      <strong>Desconocido</strong>
                      <i className="bi bi-question-circle-fill ms-2"></i>
                    </>
                  ) : (
                    <>
                      {format(row.doneDate, "dd MMM yyyy HH:mm:ss", { locale: es })}
                      <i className="bi bi-check-circle-fill text-success ms-2"></i>
                    </>
                  )}
                </div>
              ) : (
                <WidgetDeadline date={name} warnAfter={2} />
              );
            }}
          />
          <Column
            field="User.name"
            label="Comprador"
            include={{
              User: {
                select: {
                  id: true,
                  name: true,
                  Partner: { select: { imageUrl: true } },
                },
              },
            }}
            render={(_, field) => <WidgetAvatar imageUrl={field.User.Partner.imageUrl} displayName={field.User.name} />}
          />
          <Column field="total" label="Total" type="number" render={(field) => <WidgetCurrency number={field} />} format="currency" />
          <Column
            field="state"
            label="Estado"
            render={(name) => {
              let bg = "secondary";
              if (name === "purchase") bg = "info";
              if (name === "pending") bg = "warning";
              if (name === "done") bg = "success";
              if (name === "cancel") bg = "danger";

              return (
                <div className="text-center">
                  <Badge bg={bg} pill>
                    {purchaseOrderStateDisplay[name as PurchaseOrderSchemaType["state"]]}
                  </Badge>
                </div>
              );
            }}
          />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default PurchaseListView;
