import { IPageProps } from "@/app/libs/definitions";
import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { Metadata } from "next";
import { lazy, Suspense } from "react";

export const metadata: Metadata = {
  title: "Facturas clientes",
};

const InvoicingMoveListView = lazy(() => import("./views/InvoicingMoveListView"));
const InvoiginMoveFormView = lazy(() => import("./views/InvoiginMoveFormView"));

async function page({ searchParams }: IPageProps) {
  const { view_type: viewType, display_type: displayType, id } = await searchParams;

  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <InvoicingMoveListView />
      </Suspense>
    );
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <InvoiginMoveFormView />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default page;
