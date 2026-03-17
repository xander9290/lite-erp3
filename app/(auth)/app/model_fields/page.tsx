import NotFound from "@/app/not-found";
import { lazy, Suspense } from "react";
import { getModelFieldById } from "./actions/fields-actions";
import LoadingPage from "@/app/loading-page";

const ModelFieldsListView = lazy(() => import("./views/ModelFieldsListView"));
const ModelFieldsFormView = lazy(() => import("./views/ModelFieldsFormView"));

async function PageModelFields({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: ViewType, id } = await searchParams;

  const modelField =
    id && id !== "null" ? await getModelFieldById({ id }) : null;

  if (ViewType === "list") {
    return <ModelFieldsListView />;
  } else if (ViewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <ModelFieldsFormView id={id} modelField={modelField} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default PageModelFields;
