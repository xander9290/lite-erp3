import { IPageProps } from "@/app/libs/definitions";
import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { Metadata } from "next";
import { lazy, Suspense } from "react";
import { getInvoiceMoveById } from "./actions/invoiceMode.action";

export const metadata: Metadata = {
  title: "Facturas",
};

const InvoicingMoveListView = lazy(() => import("./views/InvoicingMoveListView"));
const InvoiginMoveFormView = lazy(() => import("./views/InvoiginMoveFormView"));

async function page({ searchParams }: IPageProps) {
  const { view_type: viewType, display_type: displayType, id } = await searchParams;

  if (!displayType || displayType === undefined || displayType === "" || displayType === null) {
    return <NotFound />;
  }

  const invoiceMove = id && id !== "null" ? await getInvoiceMoveById({ id }) : null;

  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <InvoicingMoveListView displayType={displayType} />
      </Suspense>
    );
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <InvoiginMoveFormView id={id} invoiceMove={invoiceMove} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default page;
