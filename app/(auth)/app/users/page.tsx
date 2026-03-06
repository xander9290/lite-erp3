import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { lazy, Suspense } from "react";
import { getUserById, UserWithProps } from "./actions/actions";

const UsersFormView = lazy(() => import("./views/UsersFormView"));
const UsersListView = lazy(() => import("./views/UsersListView"));

async function PageUsers({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { id, view_type: viewType } = await searchParams;

  const user = id && id !== "null" ? await getUserById({ id }) : null;

  if (viewType === "list") {
    return <UsersListView />;
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <UsersFormView id={id} user={user} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default PageUsers;
