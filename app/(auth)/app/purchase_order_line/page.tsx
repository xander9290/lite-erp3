import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { lazy, Suspense } from "react";

const PurchaseOrderLineListView = lazy(
  () => import("./views/PurchaseOrderLineListView"),
);

async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: viewType, order_id: orderId } = await searchParams;

  if (!orderId && orderId === "") {
    return <NotFound />;
  }

  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <PurchaseOrderLineListView orderId={orderId} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default page;
