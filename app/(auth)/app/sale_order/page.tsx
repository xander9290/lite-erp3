import NotFound from "@/app/not-found";
import { lazy, Suspense } from "react";
import { getSaleOrderById } from "./actions/saleOrder.action";
import { Metadata } from "next/types";
import LoadingPage from "@/app/loading-page";

export const metadata: Metadata = {
  title: "Ventas",
};

const SaleOrderViewList = lazy(() => import("./views/SaleOrderViewList"));
const SaleOrderViewForm = lazy(() => import("./views/SaleOrderViewForm"));
const SaleOrderKanbanView = lazy(() => import("./views/SaleOrderKanbanView"));

async function page({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const { view_type: viewType, id, state } = await searchParams;

  const saleOrder = id && id !== "null" ? await getSaleOrderById({ id }) : null;

  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <SaleOrderViewList state={state} />
      </Suspense>
    );
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <SaleOrderViewForm id={id} saleOrder={saleOrder} />
      </Suspense>
    );
  } else if (viewType === "kanban") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <SaleOrderKanbanView state={state} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default page;
