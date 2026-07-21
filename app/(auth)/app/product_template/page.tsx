import {
  ApplicationGridTemplate,
  ApplicationMenuItem,
} from "@/components/templates/applicationGridItem/ApplicationGridItemProps";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plantilla de producto",
};

const apps: ApplicationMenuItem[] = [
  {
    href: "/app/product_template/products?view_type=kanban&id=null",
    label: "Lista de productos",
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

function PageProductTemplate() {
  return <ApplicationGridTemplate applications={apps} title="Menu productos" />;
}

export default PageProductTemplate;
