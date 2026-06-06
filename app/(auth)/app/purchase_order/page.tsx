import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { lazy, Suspense } from "react";
import { getPurchaseById } from "./actions/purchase.action";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Órdenes de compra",
};

const PurchaseListView = lazy(() => import("./views/PurchaseListView"));
const PurchaseFormView = lazy(() => import("./views/PurchaseFormView"));

async function PagePurchase({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const { view_type: viewType, id, state } = await searchParams;

  const purchase = id && id !== "null" ? await getPurchaseById({ id }) : null;

  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <PurchaseListView state={state} />
      </Suspense>
    );
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <PurchaseFormView id={id} purchase={purchase} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default PagePurchase;
