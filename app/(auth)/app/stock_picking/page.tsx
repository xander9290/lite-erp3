import { lazy, Suspense } from "react";

import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { getStockPickingById } from "./actions/stockPicking.action";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Operaciones",
};

const StockPickingListView = lazy(() => import("./views/StockPickingListView"));
const StockPickingFormView = lazy(() => import("./views/StockPickingFormView"));

async function page({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const { view_type: viewType, id, po_id, so_id } = await searchParams;

  const picking = id && id !== "null" ? await getStockPickingById({ id }) : null;

  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <StockPickingListView poId={po_id} soId={so_id} />
      </Suspense>
    );
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <StockPickingFormView id={id} picking={picking} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default page;
