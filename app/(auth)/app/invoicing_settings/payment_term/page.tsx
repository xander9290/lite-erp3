import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { lazy, Suspense } from "react";
import { getIPaymentTermById } from "./actions/ipaymentTerm.action";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "Facturación -> Términos de pago",
};

const IPaymentTermListView = lazy(() => import("./views/IPaymentTermListView"));
const IPaymentTermFormView = lazy(() => import("./views/IPaymentTermFormView"));

async function page({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const { view_type: viewType, id } = await searchParams;

  const ipaymentTerm = id && id !== "null" ? await getIPaymentTermById({ id }) : null;

  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <IPaymentTermListView />
      </Suspense>
    );
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <IPaymentTermFormView id={id} ipaymentTerm={ipaymentTerm} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default page;
