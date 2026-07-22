"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";
import { WidgetAvatar, WidgetBadgeStatus, WidgetCurrency } from "@/components/widgets";
import { Tag } from "@/generated/prisma/browser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "react-bootstrap";
import { computeStocks } from "./ProductTemplateFormView";
import { useAuth } from "@/hooks/sessionStore";

function ProductTemplateListView({ categoryId, brandId, uomId }: { categoryId: string | null; brandId: string | null; uomId: string | null }) {
  const { companyId } = useAuth();
  const [active, setActive] = useState(true);

  const domain = [["active", "=", active]];
  if (categoryId) domain.push(["productCategoryId", "=", categoryId]);
  if (brandId) domain.push(["productBrandId", "=", brandId]);
  if (uomId) domain.push(["uomId", "=", uomId]);

  const router = useRouter();

  return (
    <ListView model="product_template">
      <ListView.Header
        title="Productos"
        formView="/app/product_template/products?view_type=form&id=null"
        actions={[
          {
            action: () => setActive(!active),
            name: "showActive",
            string: `${active ? "Inactivos" : "Activos"}`,
          },
        ]}
      >
        <Link href="/app/product_template/products?view_type=kanban&id=null" className="btn btn-info">
          <i className="bi bi-table"></i>
        </Link>
      </ListView.Header>
      <ListView.Body>
        <TableTemplateLite model="productTemplate" baseDomain={domain} onRowClick={(row) => router.push(`/app/product_template/products?view_type=form&id=${row.id}`)} defaultOrder="createdAt desc">
          <Column field="name" label="Nombre" render={(name, field) => <WidgetAvatar imageUrl={field?.imageUrl} displayName={name} />} />
          <Column field="price1" label="Precio" type="number" render={(name) => <WidgetCurrency number={name} />} />
          <Column
            field="Tags"
            label="Etiquetas"
            type="relation"
            include={{
              Tags: { select: { id: true, name: true } },
            }}
            render={(_, field) => (
              <div className="d-flex flew-row justify-content-center gap-1">
                {field.Tags.map((t: Tag) => (
                  <Badge pill key={t.id}>
                    {t.name}
                  </Badge>
                ))}
              </div>
            )}
          />
          <Column
            field="_"
            sortable={false}
            type="number"
            label="Disponible"
            render={(_, fields) => (
              <div className="text-end">
                {computeStocks({ product: fields, companyId })} {fields.Uom.code}
              </div>
            )}
            include={{
              Stocks: {
                select: {
                  qty: true,
                  reservedQty: true,
                  Warehouse: { select: { type: true, companyId: true } },
                },
              },
              Uom: { select: { code: true } },
            }}
          />
          <Column
            field="ProductBrand.name"
            label="Marca"
            include={{
              ProductBrand: {
                select: { id: true, name: true, description: true },
              },
            }}
          />
          <Column field="ProductCategory.name" label="Categoría" include={{ ProductCategory: { select: { id: true, name: true } } }} />
          <Column field="active" label="Activo" type="boolean" />
          <Column
            field="state"
            label="Estado"
            render={(name) => (
              <WidgetBadgeStatus
                value={name}
                options={{
                  AVAILABLE: { label: "DISPONIBLE", color: "success" },
                  NOT_AVAILABLE: { label: "AGOTADO", color: "danger" },
                }}
              />
            )}
          />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default ProductTemplateListView;
