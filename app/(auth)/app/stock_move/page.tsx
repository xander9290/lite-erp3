import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { lazy, Suspense } from "react";

const StockMoveListView = lazy(() => import("./views/StockMoveListView"));
const StockMoveFormView = lazy(() => import("./views/StockMoveFormView"));

async function PageStockMove({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const { view_type: viewType, product_id: productId } = await searchParams;
  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <StockMoveListView productId={productId} />
      </Suspense>
    );
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <StockMoveFormView />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default PageStockMove;
