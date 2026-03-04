import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { lazy, Suspense } from "react";

const UsersFormView = lazy(() => import("./views/UsersFormView"));

async function PageUsers({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { id, view_type: viewType } = await searchParams;

  if (viewType === "list") {
    return <h2>List View</h2>;
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
