"use client";

import { CardTemplateLite } from "@/components/templates/CardTemplateLite";
import ListView from "@/components/templates/ListView";
import CardProduct from "./CardProduct";
import { useState } from "react";
import { Column } from "@/components/templates/table/Column";
import type { ProductDisplayType } from "@/generated/prisma/browser";
import { ProductTemplateWithProps } from "../actions/productTemplate.action";
import Link from "next/link";

type ProductDisplayOutput = Record<ProductDisplayType, string>;
export const productDisplayOutput: ProductDisplayOutput = {
  CONSU: "consumible",
  PRODUCT: "producto",
  SERVICE: "servicio",
  BOM: "elaborado",
};

function ProductTemplatKanbanView({
  categoryId,
  brandId,
  uomId,
}: {
  categoryId: string | null;
  brandId: string | null;
  uomId: string | null;
}) {
  const [active, setActive] = useState(true);

  const domain = [["active", "=", active]];
  if (categoryId) domain.push(["productCategoryId", "=", categoryId]);
  if (brandId) domain.push(["productBrandId", "=", brandId]);
  if (uomId) domain.push(["uomId", "=", uomId]);

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
        <Link
          href="/app/product_template/products?view_type=list&id=null"
          className="btn btn-info"
          title="Vista lista"
        >
          <i className="bi bi-list"></i>
        </Link>
      </ListView.Header>
      <ListView.Body>
        <CardTemplateLite
          model="productTemplate"
          viewForm="/app/product_template/products?view_type=form"
          baseDomain={domain}
          renderCard={(p) => (
            <CardProduct product={p as ProductTemplateWithProps} />
          )}
          defaultOrder="name asc"
        >
          <Column field="name" label="Nombre" />
          <Column field="description" label="Descripción" />
          <Column field="defaultCode" label="Código interno" />
          <Column
            field="Tags"
            label="Etiquetas"
            type="relation"
            include={{
              Tags: { select: { id: true, name: true } },
            }}
          />
          <Column
            field="ProductCategory.name"
            label="Categoría"
            include={{ ProductCategory: { select: { id: true, name: true } } }}
          />
          <Column field="price1" label="Precio" type="number" />
          <Column field="active" label="Activo" type="boolean" />
          <Column field="state" label="Estado" />
          <Column
            field="ProductBrand.name"
            label="Marca"
            include={{
              ProductBrand: {
                select: { id: true, name: true, description: true },
              },
              Stocks: {
                select: {
                  qty: true,
                  reservedQty: true,
                  Warehouse: { select: { type: true } },
                },
              },
              Uom: { select: { code: true } },
            }}
          />
        </CardTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default ProductTemplatKanbanView;
