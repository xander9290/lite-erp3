import NotFound from "@/app/not-found";
import { lazy, Suspense } from "react";
import { getModelById } from "./actions/model-actions";
import LoadingPage from "@/app/loading-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modelos de la aplicación",
};

const ModelListView = lazy(() => import("./views/ModelListView"));
const ModelFormView = lazy(() => import("./views/ModelFormView"));

async function PageModels({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const { view_type: viewType, id } = await searchParams;

  const entity = id && id !== "null" ? await getModelById({ id }) : null;

  if (viewType === "list") {
    return <ModelListView />;
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <ModelFormView id={id} entity={entity} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default PageModels;
