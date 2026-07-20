import { SidebarTemplate } from "@/components/templates/saidebarTemplate/SidebarTemplate";

const menu = [
  {
    label: "Facturas",
    href: "/app/account_invoicing/moves?view_type=list&id=null",
    icon: "bi bi-receipt",
  },
  {
    label: "Pagos",
    href: "/app/account_invoicing/payments?view_type=list&id=null",
    icon: "bi bi-cash-stack",
  },
  {
    label: "Notas de crédito",
    href: "/app/account_invoicing/refunds?view_type=list&id=null",
    icon: "bi bi-receipt-cutoff",
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
      title="Facturacion"
      icon="bi bi-person-vcard-fill"
    >
      {children}
    </SidebarTemplate>
  );
}

export default layout;
