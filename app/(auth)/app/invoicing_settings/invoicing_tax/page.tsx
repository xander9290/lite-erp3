import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { lazy, Suspense } from "react";
import { getInvoicingTaxById } from "./action/invoicingTax.action";

const ITaxListView = lazy(() => import("./views/ITaxListView"));
const ITaxFormView = lazy(() => import("./views/ITaxFormView"));

async function page({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const { view_type: viewType, id } = await searchParams;

  const invoicingTax = id && id !== "null" ? await getInvoicingTaxById({ id }) : null;

  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <ITaxListView />
      </Suspense>
    );
  } else if (viewType === "form") {
    return (
      <Suspense>
        <ITaxFormView id={id} invoicingTax={invoicingTax} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default page;
