"use client";

import CardTemplate from "@/components/templates/CardTemplate";
import ListView from "@/components/templates/ListView";
import { TableTemplateColumn } from "@/components/templates/TableTemplate";
import { ProductTemplateWithProps } from "../../actions/productTemplate.action";
import CardProduct from "./CardProduct";
import { useState } from "react";

const PRODUCT_COLUMNS: TableTemplateColumn<ProductTemplateWithProps>[] = [
  {
    key: "name",
    accessor: (p) => p.name,
    label: "Nombre",
    type: "string",
  },
  {
    key: "description",
    accessor: (p) => p.description,
    label: "Descripción",
    type: "string",
  },
  {
    key: "defaultCode",
    accessor: (p) => p.defaultCode,
    label: "Referencia interna",
    type: "string",
  },
  {
    key: "price1",
    accessor: (p) => p.price1,
    label: "Precio 1",
    type: "number",
  },
  {
    key: "Tags[].name",
    accessor: (p) => p.Tags,
    label: "Etiquetas",
    type: "string",
  },
  {
    key: "imageUrl",
    accessor: (p) => p.imageUrl,
    label: "Imagen",
  },
  {
    key: "state",
    accessor: (p) => p.state,
    label: "Estado",
    type: "string",
  },
];

function ProductTemplateListView() {
  const [active, setActive] = useState(true);

  return (
    <ListView model="product_template">
      <ListView.Header
        title="Productos"
        formView="/app/product_template?view_type=form&id=null"
        actions={[
          {
            action: () => setActive(!active),
            name: "showActive",
            string: `${active ? "Inactivos" : "Activos"}`,
          },
        ]}
      />
      <ListView.Body>
        <CardTemplate
          columns={PRODUCT_COLUMNS}
          getRowId={(p) => p.id}
          model="productTemplate"
          renderCard={(p) => <CardProduct product={p} />}
          defaultOrder="description asc"
          domain={[["active", "=", active]]}
          viewForm="/app/product_template/products?view_type=form"
        />
      </ListView.Body>
    </ListView>
  );
}

export default ProductTemplateListView;
