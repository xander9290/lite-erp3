"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";
import { WidgetAvatar, WidgetBadgeStatus, WidgetCurrency, WidgetDisplayDate } from "@/components/widgets";
import { useAuth } from "@/hooks/sessionStore";
import { useRouter } from "next/navigation";

function SaleOrderViewList({ state }: { state: string }) {
  const { companyId } = useAuth();

  const domain: any[] = [["companyId", "=", companyId]];
  if (state === "draft") {
    domain.push(["state", "in", ["draft", "cancel"]]);
  } else {
    domain.push(["state", "in", ["sale", "done"]]);
  }

  const router = useRouter();

  return (
    <ListView model="saleOrder">
      <ListView.Header title={`${state === "draft" ? "Ventas cotizaciones" : "Órdenes de venta"}`} formView="/app/sale_order?view_type=form&id=null" />
      <ListView.Body>
        <TableTemplateLite
          model="saleOrder"
          defaultOrder="name desc"
          pageSize={100}
          baseDomain={domain}
          onRowClick={(row) => router.push(`/app/sale_order?view_type=form&id=${row.id}`)}
          showTotals={true}
          totalColumns={["total"]}
        >
          <Column field="name" label="Número" render={(name) => <span className="fw-semibold">{name}</span>} />
          <Column field="orderDate" label="Fecha" type="date" render={(name) => <WidgetDisplayDate date={name} />} />
          <Column field="Partner.name" label="Cliente" include={{ Partner: { select: { id: true, name: true } } }} />
          <Column
            field="SaleUser.name"
            label="Vendedor"
            include={{
              SaleUser: {
                select: {
                  id: true,
                  name: true,
                  Partner: { select: { imageUrl: true } },
                },
              },
            }}
            render={(_, field) => <WidgetAvatar imageUrl={field.SaleUser.Partner.imageUrl} displayName={field.SaleUser.name} />}
          />
          <Column field="ShippingWay.name" label="Forma de envío" include={{ ShippingWay: { select: { id: true, name: true } } }} />
          <Column field="total" label="Total" type="number" render={(name) => <WidgetCurrency number={name} />} format="currency" />
          <Column
            field="state"
            label="Estado"
            render={(name) => (
              <div className="text-center">
                <WidgetBadgeStatus
                  value={name}
                  options={{
                    draft: { label: "Borrador", color: "secondary" },
                    sale: { label: "Venta", color: "info" },
                    done: { label: "Terminado", color: "success" },
                    cancel: { label: "Cancelado", color: "danger" },
                  }}
                />
              </div>
            )}
          />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default SaleOrderViewList;
