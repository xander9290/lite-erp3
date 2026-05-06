"use client";

import { CardTemplateLite } from "@/components/templates/CardTemplateLite";
import ListView from "@/components/templates/ListView";
import CardProduct from "./CardProduct";
import { useState } from "react";
import { Column } from "@/components/templates/table/Column";
import type { ProductDisplayType } from "@/generated/prisma/browser";

type ProductDisplayOutput = Record<ProductDisplayType, string>;
export const productDisplayOutput: ProductDisplayOutput = {
  CONSU: "consumible",
  PRODUCT: "producto",
  SERVICE: "servicio",
};

function ProductTemplateListView({
  categoryId,
}: {
  categoryId: string | null;
}) {
  const [active, setActive] = useState(true);

  const domain = [["active", "=", active]];
  if (categoryId) domain.push(["productCategoryId", "=", categoryId]);

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
      />
      <ListView.Body>
        <CardTemplateLite
          model="productTemplate"
          viewForm="/app/product_template/products?view_type=form"
          baseDomain={domain}
          renderCard={(p) => <CardProduct product={p} />}
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
        </CardTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default ProductTemplateListView;
