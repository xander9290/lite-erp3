"use client";

import { invoiceDisplayType } from "@/app/libs/definitions";
import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";
import { WidgetBadgeStatus, WidgetCurrency, WidgetDeadline, WidgetDisplayDate } from "@/components/widgets";
import { InvoiceDisplayType } from "@/generated/prisma/browser";
import { useAuth } from "@/hooks/sessionStore";

import { useRouter } from "next/navigation";

function InvoicingMoveListView({ displayType }: { displayType: string }) {
  const { companyId } = useAuth();

  const router = useRouter();

  return (
    <ListView model="invoicing">
      <ListView.Header title={`Facturas de ${invoiceDisplayType[displayType as InvoiceDisplayType]}`} formView={`/app/invoicing/moves?view_type=form&id=null&display_type=${displayType}`} />
      <ListView.Body>
        <TableTemplateLite
          onRowClick={(row) => router.push(`/app/invoicing/moves?view_type=form&id=${row.id}&display_type=${displayType}`)}
          baseDomain={[
            ["displayType", "=", displayType],
            ["Journal.companyId", "=", companyId],
          ]}
          defaultOrder="createdAt desc"
          model="invoicingInvoice"
          pageSize={100}
        >
          <Column field="name" label="Número" render={(name) => <span className="fw-semibold">{name}</span>} />
          <Column field="Journal.name" label="Diario" include={{ Journal: { select: { id: true, name: true } } }} />
          <Column field="date" label="Fecha" type="date" render={(name) => <WidgetDisplayDate date={name} />} />
          <Column field="Partner.name" label="Cliente" include={{ Partner: { select: { id: true, name: true } } }} />
          {displayType === "supplier" && <Column field="reference" label="Referencia" />}
          <Column field="invoiceDate" label="Fecha de factura" type="date" render={(name) => <WidgetDisplayDate date={name} />} />
          <Column field="PaymentTerm.name" label="Términos de pago" include={{ PaymentTerm: { select: { id: true, name: true } } }} render={(name) => <div className="text-center">{name}</div>} />
          <Column field="invoiceDateDue" label="Vencimiento" type="date" render={(name) => <WidgetDeadline date={name} warnAfter={7} />} />
          <Column field="subtotal" label="Subtotal" type="number" render={(name) => <WidgetCurrency number={name} />} />
          <Column field="taxAmount" label="Impuestos" type="number" render={(name) => <WidgetCurrency number={name} />} />
          <Column field="total" label="Total" type="number" render={(name) => <WidgetCurrency number={name} />} />
          <Column
            field="state"
            label="Estado"
            render={(name) => (
              <WidgetBadgeStatus
                value={name}
                options={{
                  draft: { label: "Borrador", color: "secondary" },
                  confirmed: { label: "Confirmado", color: "primary" },
                  sent: { label: "Publicado", color: "success" },
                  partial: { label: "Pagado parcial", color: "warning" },
                  paid: { label: "Pagado", color: "success" },
                  cancelled: { label: "Cancelado", color: "danger" },
                }}
              />
            )}
          />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default InvoicingMoveListView;
