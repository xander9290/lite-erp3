import LoadingPage from "@/app/loading-page";
import { lazy, Suspense } from "react";
import { getProductCategoryById } from "./actions/productCategory.action";

const ProductCategoryListView = lazy(
  () => import("./views/ProductCategoryListView"),
);

const ProductCategoryFormView = lazy(
  () => import("./views/ProductCategoryFormView"),
);

async function PageCategories({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { id, view_type: viewType } = await searchParams;

  const productCategory =
    id && id !== "null" ? await getProductCategoryById({ id }) : null;

  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <ProductCategoryListView />
      </Suspense>
    );
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <ProductCategoryFormView productCategory={productCategory} id={id} />
      </Suspense>
    );
  }
}

export default PageCategories;
