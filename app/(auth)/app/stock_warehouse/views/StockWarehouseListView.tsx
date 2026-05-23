"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateLite } from "@/components/templates/table";
import { Column } from "@/components/templates/table/Column";

function StockWarehouseListView({ productId, whId }: { productId: string | null; whId: string | null }) {
  const domain = [["qty", ">", 0.0]];
  if (productId) domain.push(["productId", "=", productId]);
  if (whId) domain.push(["warehouseId", "=", whId]);

  return (
    <ListView model="stock_warehouse">
      <ListView.Header title="Existencias" />
      <ListView.Body>
        <TableTemplateLite model="stockWarehouse" defaultOrder="qty desc" baseDomain={domain} pageSize={100}>
          <Column field="Warehouse.name" label="Almacén" include={{ Warehouse: { select: { name: true } } }} />
          <Column field="locationName" label="Ubicación" type="string" />
          <Column field="Product.name" label="Producto" include={{ Product: { select: { name: true, Uom: { select: { name: true } } } } }} />
          <Column field="qty" label="Cantidad" type="number" render={(_, stock) => <div className="text-end">{stock.qty}</div>} />
          <Column field="reservedQty" label="Reservado" type="number" render={(_, stock) => <div className="text-end">{stock.reservedQty}</div>} />
          <Column field="_" label="Disponible" type="number" render={(_, stock) => <div className="text-end">{stock.qty - stock.reservedQty}</div>} />
          <Column field="Product.Uom.name" label="UdM" />
        </TableTemplateLite>
      </ListView.Body>
    </ListView>
  );
}

export default StockWarehouseListView;
