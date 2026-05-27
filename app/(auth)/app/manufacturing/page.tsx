import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { lazy, Suspense } from "react";
import { getManufacturingById } from "./actions/manufacturing.action";

const ManufacturingListView = lazy(() => import("./views/ManufacturingListView"));
const ManufacturingFormView = lazy(() => import("./views/ManufacturingFormView"));

async function ManufacturingPage({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const { view_type: viewType, id } = await searchParams;

  const manufacturing = id && id !== "null" ? await getManufacturingById({ id }) : null;

  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <ManufacturingListView />
      </Suspense>
    );
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <ManufacturingFormView id={id} manufacturing={manufacturing} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default ManufacturingPage;
