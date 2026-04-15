"use client";

import ListView from "@/components/templates/ListView";
import { useState } from "react";

const WAREHOUSE_COLUMNS = [];

function WarehousesListView() {
  const [active, setActive] = useState(true);

  return (
    <ListView model="warehouses">
      <ListView.Header
        title="Almacenes"
        formView="/app/warehouses?view_type=form&id=null"
      />
    </ListView>
  );
}

export default WarehousesListView;
