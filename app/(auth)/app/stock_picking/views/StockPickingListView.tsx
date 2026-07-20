"use client";

import { FieldText } from "@/components/templates/fields";
import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";
import {
  WidgetAvatar,
  WidgetBadgeStatus,
  WidgetDeadline,
  WidgetDisplayDate,
  WidgetLiveRemaining,
} from "@/components/widgets";
import { useAuth } from "@/hooks/sessionStore";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dropdown, DropdownButton } from "react-bootstrap";

function StockPickingListView({
  poId,
  soId,
}: {
  poId: string | null;
  soId: string | null;
}) {
  const { company } = useAuth();

  const domain = [];

  if (poId) {
    domain.push(["purchaseId", "=", poId]);
  } else if (soId) {
    domain.push(["saleId", "=", soId]);
  } else {
    domain.push([
      "OR",
      [
        ["companyId", "=", company?.id],
        ["companyOriginId", "=", company?.id],
      ],
    ]);
  }

  const router = useRouter();

  return (
    <ListView model="stockPicking">
      <ListView.Header
        title={`Operaciones ${company?.name}`}
        formView="/app/stock_picking?view_type=form&id=null"
      >
        <DropdownButton title="Resumen" variant="info">
          <Dropdown.Item
            as={Link}
            href="/app/stock_picking?view_type=line&id=null&move_type=outgoing"
          >
            Productos salientes
          </Dropdown.Item>
          <Dropdown.Item
            as={Link}
            href="/app/stock_picking?view_type=line&id=null&move_type=incomming"
          >
            productos entrantes
          </Dropdown.Item>
        </DropdownButton>
      </ListView.Header>
      <ListView.Body>
        <TableTemplateLite
          pageSize={100}
          onRowClick={(row) =>
            router.push(`/app/stock_picking?view_type=form&id=${row.id}`)
          }
          defaultOrder="confirmedDate asc"
          model="stockPicking"
          baseDomain={domain}
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
                  imageUrl: true,
                  Company: { select: { id: true } },
                },
              },
            }}
            render={(name, field) => (
              <WidgetAvatar
                imageUrl={field.Partner.imageUrl}
                displayName={name}
              />
            )}
          />
          <Column
            field="reference"
            label="Referencia"
            render={(field) => (
              <FieldText name="stockPickingReference" output={field} />
            )}
          />
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
            render={(field) => (
              <FieldText name="stockPickingOrigin" output={field} />
            )}
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
            render={(field) => (
              <FieldText name="stockPickingDest" output={field} />
            )}
          />
          <Column
            field="Operator.name"
            label="Almacenista"
            include={{
              Operator: { select: { id: true, name: true, imageUrl: true } },
            }}
            render={(name, field) => (
              <WidgetAvatar
                imageUrl={field.Operador?.imageUrl}
                displayName={name}
              />
            )}
          />
          <Column
            field="datePlanned"
            label="Fecha de entrega"
            type="date"
            render={(field) => <WidgetDeadline date={field} warnAfter={1} />}
          />
          <Column
            field="confirmedDate"
            label="Confirmado"
            type="datetime"
            render={(field, row) =>
              row.state === "done" ? (
                <span>
                  {format(field, "dd MMM yyy HH:mm:ss", { locale: es })}
                </span>
              ) : (
                <WidgetLiveRemaining date={field} />
              )
            }
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
