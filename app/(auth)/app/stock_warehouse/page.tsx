import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { Metadata } from "next";
import { lazy, Suspense } from "react";

export const metadata: Metadata = {
  title: "Existencias de almacén",
};

const StockWarehouseListView = lazy(() => import("./views/StockWarehouseListView"));
const StockWarehouseFormView = lazy(() => import("./views/StockWarehouseFormView"));

async function StockWarehousePage({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const { view_type: viewType, id, product_id: productId, wh_id: whId } = await searchParams;

  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <StockWarehouseListView productId={productId} whId={whId} />
      </Suspense>
    );
  } else if (viewType === "form") {
    return (
      <Suspense>
        <StockWarehouseFormView id={id} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default StockWarehousePage;
