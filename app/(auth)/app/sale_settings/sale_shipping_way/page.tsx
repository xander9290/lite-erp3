import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { lazy, Suspense } from "react";
import { getSaleShippingWayById } from "./actions/saleShippingWay.action";

const ShippingWayListView = lazy(() => import("./views/ShippingWayListView"));
const ShippingWayFormView = lazy(() => import("./views/ShippingWayFormView"));

async function page({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const { view_type: viewType, id } = await searchParams;

  const shippingWay = id && id !== "null" ? await getSaleShippingWayById({ id }) : null;

  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <ShippingWayListView />
      </Suspense>
    );
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <ShippingWayFormView id={id} shippingWay={shippingWay} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default page;
