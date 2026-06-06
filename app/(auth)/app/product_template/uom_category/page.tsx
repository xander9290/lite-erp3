import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { lazy, Suspense } from "react";
import { getUomById } from "./actions/uom.action";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Productos -> Unidades de medida",
};

const UomListView = lazy(() => import("./views/UomListView"));
const UomFormView = lazy(() => import("./views/UomFormView"));

async function PageUom({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const { view_type: viewType, id } = await searchParams;

  const uom = id && id !== "null" ? await getUomById({ id }) : null;

  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <UomListView />
      </Suspense>
    );
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <UomFormView id={id} uom={uom} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default PageUom;
