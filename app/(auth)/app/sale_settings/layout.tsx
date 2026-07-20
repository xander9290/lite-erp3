"use client";
import { SidebarTemplate } from "@/components/templates/saidebarTemplate/SidebarTemplate";

const menu = [
  {
    label: "Formas de envío",
    href: "/app/sale_settings/sale_shipping_way?view_type=list&id=null",
    icon: "bi bi-truck",
  },
];

function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarTemplate
      menu={menu}
      title="Configuración de ventas"
      icon="bi bi-gear"
    >
      {children}
    </SidebarTemplate>
  );
}

export default layout;
