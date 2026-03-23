import LoadingPage from "@/app/loading-page";
import NotFound from "@/app/not-found";
import { lazy, Suspense } from "react";
import { getCompanyById } from "./actions/companies-actions";

const CompaniesListView = lazy(() => import("./views/CompaniesListView"));
const CompaniesFormView = lazy(() => import("./views/CompaniesFormView"));

async function PageCompanies({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: viewType, id } = await searchParams;

  const company = id && id !== "null" ? await getCompanyById({ id }) : null;

  if (viewType === "list") {
    return <CompaniesListView />;
  } else if (viewType === "form") {
    return (
      <Suspense fallback={<LoadingPage />}>
        <CompaniesFormView company={company} id={id} />
      </Suspense>
    );
  } else {
    return <NotFound />;
  }
}

export default PageCompanies;
