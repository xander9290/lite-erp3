"use client";

import { formatNumberForDisplay } from "@/app/libs/helpers";
import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";
import { useAuth } from "@/hooks/sessionStore";

function StockMoveListView({ productId }: { productId: string | null }) {
  const { companyId } = useAuth();
  const domain = [["companyId", "=", companyId]];
  if (productId) domain.push(["productId", "=", productId]);
  return (
    <ListView model="stock_move">
      <ListView.Header title="Historial de movimientos" />
      <ListView.Body>
        <TableTemplateLite model="stockMove" defaultOrder="createdAt desc" pageSize={100} baseDomain={domain}>
          <Column field="createdAt" label="Fecha" type="datetime" />
          <Column field="name" label="Nombre" />
          <Column field="reference" label="Referencia" />
          <Column field="Product.name" label="Producto" include={{ Product: { select: { name: true, Uom: { select: { code: true } } } } }} />
          <Column field="WarehouseOrigin.description" label="Origen" include={{ WarehouseOrigin: { select: { description: true } } }} />
          <Column field="WarehouseDest.description" label="Destino" include={{ WarehouseDest: { select: { description: true } } }} />
          <Column
            field="quantity"
            label="Cantidad"
            type="number"
            render={(_, move) => (
              <div className={`text-end ${move.moveType === "incoming" ? "text-success" : "text-danger"}`}>
                {formatNumberForDisplay(move.quantity, 3)} {move.Product.Uom.code}
              </div>
            )}
          />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default StockMoveListView;
