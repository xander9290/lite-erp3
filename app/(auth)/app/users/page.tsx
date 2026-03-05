import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { lazy, Suspense } from "react";

const UsersFormView = lazy(() => import("./views/UsersFormView"));
const UsersListView = lazy(() => import("./views/UsersListView"));

async function PageUsers({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { id, view_type: viewType } = await searchParams;

  if (viewType === "list") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <UsersListView />
      </Suspense>
    );
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <UsersFormView id={id} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default PageUsers;
