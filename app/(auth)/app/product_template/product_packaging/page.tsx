import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { lazy, Suspense } from "react";
import { getProductPackagingById } from "./actions/productPackaging.action";

const ProductPackagingListView = lazy(() => import("./views/ProductPackagingListView"));
const ProductPackagingFormView = lazy(() => import("./views/ProductPackagingFormView"));

async function ProductPackagingPage({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const { view_type: viewType, id } = await searchParams;

  const packaging = id && id !== "null" ? await getProductPackagingById({ id }) : null;

  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <ProductPackagingListView />
      </Suspense>
    );
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <ProductPackagingFormView id={id} packaging={packaging} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default ProductPackagingPage;
