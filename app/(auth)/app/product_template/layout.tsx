import {
  SidebarMenuItem,
  SidebarTemplate,
} from "@/components/templates/saidebarTemplate/SidebarTemplate";
import React from "react";

const menu: SidebarMenuItem[] = [
  {
    href: "/app/product_template/products?view_type=list&id=null",
    label: "Productos",
    icon: "bi bi-boxes",
  },
  {
    href: "/app/product_template/categories?view_type=list&id=null",
    label: "Categorías",
    icon: "bi bi-diagram-3",
  },
  {
    href: "/app/product_template/brands?view_type=list&id=null",
    label: "Marcas",
    icon: "bi bi-bookmarks",
  },
  {
    href: "/app/product_template/uom_category?view_type=list&id=null",
    label: "Unidades de medida",
    icon: "bi bi-flask-florence",
  },
  {
    href: "/app/product_template/product_packaging?view_type=list&id=null",
    label: "Embalajes",
    icon: "bi bi-box-seam",
  },
];

function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarTemplate menu={menu} title="Menú productos">
      {children}
    </SidebarTemplate>
  );
}

export default layout;
