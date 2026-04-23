import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { lazy, Suspense } from "react";
import { getProductById } from "../actions/productTemplate.action";

const ProductTemplateListView = lazy(
  () => import("./views/ProductTemplateListView"),
);

const ProductTemplateFormView = lazy(
  () => import("./views/ProductTemplateFormView"),
);

async function PageProductTemplate({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: viewType, id } = await searchParams;

  const product = id && id !== "null" ? await getProductById({ id }) : null;

  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <ProductTemplateListView />
      </Suspense>
    );
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <ProductTemplateFormView id={id} product={product} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default PageProductTemplate;
