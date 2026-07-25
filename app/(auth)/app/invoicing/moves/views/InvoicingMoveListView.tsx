"use client";

import { invoiceDisplayType } from "@/app/libs/definitions";
import ListView from "@/components/templates/ListView";
import { InvoiceDisplayType } from "@/generated/prisma/browser";

function InvoicingMoveListView({ displayType }: { displayType: string }) {
  return (
    <ListView model="invoicing">
      <ListView.Header
        title={`Facturas de ${invoiceDisplayType[displayType as InvoiceDisplayType]}`}
        formView={`/app/invoicing/moves?view_type=form&id=null&display_type=${displayType}`}
      />
    </ListView>
  );
}

export default InvoicingMoveListView;
