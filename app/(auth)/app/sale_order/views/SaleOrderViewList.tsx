"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";
import { useAuth } from "@/hooks/sessionStore";
import { useRouter } from "next/navigation";

function SaleOrderViewList({ state }: { state: string }) {
  const { companyId } = useAuth();

  const domain: any[] = [["companyId", "=", companyId]];
  if (state === "draft") {
    domain.push(["state", "in", ["draft", "cancel"]]);
  } else {
    domain.push(["state", "in", ["sale", "done"]]);
  }

  const router = useRouter();

  return (
    <ListView model="saleOrder">
      <ListView.Header
        title={`${state === "draft" ? "Ventas cotizaciones" : "Órdenes de venta"}`}
        formView="/app/sale_order?view_type=form&id=null"
      />
      <ListView.Body>
        <TableTemplateLite
          model="saleOrder"
          defaultOrder="name desc"
          pageSize={100}
          baseDomain={domain}
          onRowClick={(row) =>
            router.push(`/app/sale_order?view_type=form&id=${row.id}`)
          }
        >
          <Column field="name" label="name" />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default SaleOrderViewList;
