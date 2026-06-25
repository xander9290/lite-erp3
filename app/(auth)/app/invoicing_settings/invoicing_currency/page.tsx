import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { Metadata } from "next/types";
import { lazy, Suspense } from "react";
import { getCurrencyById } from "./actions/icurrency.action";

export const metadata: Metadata = {
  title: "Facturación -> Moneda",
};

const ICurrencyListView = lazy(() => import("./views/ICurrencyListView"));
const ICurrencyFormView = lazy(() => import("./views/ICurrencyFormView"));

async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: viewType, id } = await searchParams;

  const icurrency = id && id !== "null" ? await getCurrencyById({ id }) : null;

  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <ICurrencyListView />
      </Suspense>
    );
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <ICurrencyFormView id={id} icurrency={icurrency} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default page;
