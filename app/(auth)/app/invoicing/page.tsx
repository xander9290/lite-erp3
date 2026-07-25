import { invoiceDisplayType, IPageProps } from "@/app/libs/definitions";
import ApplicationGridTemplate, {
  ApplicationMenuItem,
} from "@/components/templates/applicationGridItem/ApplicationGridItemProps";
import { InvoiceDisplayType } from "@/generated/prisma/client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facturación menú",
};

async function page({ searchParams }: IPageProps) {
  const { display_type: displayType } = await searchParams;

  const apps: ApplicationMenuItem[] = [
    {
      label: "Facturas de",
      description: invoiceDisplayType[displayType as InvoiceDisplayType],
      href: `/app/invoicing/moves?view_type=list&id=null&display_type=${displayType}`,
      icon: "bi bi-receipt",
    },
    {
      label: `Pagos ${displayType === "customer" ? "de" : "a"}`,
      description: invoiceDisplayType[displayType as InvoiceDisplayType],
      href: `/app/invoicing/payments?view_type=list&id=null&display_type=${displayType}`,
      icon: "bi bi-cash-stack",
    },
    {
      label: "Notas de crédito de",
      description: invoiceDisplayType[displayType as InvoiceDisplayType],
      href: `/app/invoicing/refunds?view_type=list&id=null&display_type=${displayType}`,
      icon: "bi bi-receipt-cutoff",
    },
  ];

  return (
    <ApplicationGridTemplate applications={apps} title="Facturación menú" />
  );
}

export default page;
