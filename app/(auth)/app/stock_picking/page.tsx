import { lazy, Suspense } from "react";

import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";

const StockPickingListView = lazy(() => import("./views/StockPickingListView"));
const StockPickingFormView = lazy(() => import("./views/StockPickingFormView"));

async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: viewType, id } = await searchParams;

  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <StockPickingListView />
      </Suspense>
    );
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <StockPickingFormView id={id} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default page;
