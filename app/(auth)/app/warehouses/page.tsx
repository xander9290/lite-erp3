import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { lazy, Suspense } from "react";
import { getWarehouseById } from "./actions/warehouse-actions";

const WarehousesListView = lazy(() => import("./views/WarehousesListView"));
const WarehouseFormView = lazy(() => import("./views/WarehouseFormView"));

async function PageWarehouse({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { id, view_type: viewType } = await searchParams;

  const warehouse = id !== "null" ? await getWarehouseById({ id }) : null;

  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <WarehousesListView />
      </Suspense>
    );
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <WarehouseFormView id={id} warehouse={warehouse} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default PageWarehouse;
