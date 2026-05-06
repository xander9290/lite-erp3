import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { lazy, Suspense } from "react";
import { getProductBrandById } from "./actions/productBrand.action";

const ProductBrandListView = lazy(() => import("./views/ProductBrandListView"));
const ProductBrandFormView = lazy(() => import("./views/ProductBrandFormView"));

async function PageProductBrand({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: viewType, id } = await searchParams;

  const productBrand =
    id && id !== "null" ? await getProductBrandById({ id }) : null;

  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <ProductBrandListView />
      </Suspense>
    );
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <ProductBrandFormView id={id} productBrand={productBrand} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default PageProductBrand;
