"use client";

import { SidebarTemplate } from "@/components/templates/saidebarTemplate/SidebarTemplate";

const menu = [
  {
    label: "Términos de pago",
    href: "/app/invoicing_settings/payment_term?view_type=list&id=null",
    icon: "bi-credit-card",
  },
  {
    label: "Impuestos",
    href: "/app/invoicing_settings/invoicing_tax?view_type=list&id=null",
    icon: "bi-percent",
  },
  {
    label: "Monedas",
    href: "/app/invoicing_settings/invoicing_currency?view_type=list&id=null",
    icon: "bi-currency-exchange",
  },
  {
    label: "Diarios",
    href: "/app/invoicing_settings/invoicing_journal?view_type=list&id=null",
    icon: "bi bi-journal-bookmark",
  },
];

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarTemplate
      title="Configuración de facturación"
      icon="bi bi-gear"
      menu={menu}
    >
      {children}
    </SidebarTemplate>
  );
}
