import NotFound from "@/app/not-found";
import { lazy } from "react";
import { getPartnerById } from "./actions/partner-actions";

const PartnersListView = lazy(() => import("./views/PartnersListView"));
const PartnersFormView = lazy(() => import("./views/PartnerFormView"));

async function PagePartners({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: viewType, id, display } = await searchParams;

  if (!display) return <NotFound />;

  const partner = id && id !== "null" ? await getPartnerById({ id }) : null;

  if (viewType === "list") {
    return <PartnersListView display={display.toUpperCase()} />;
  } else if (viewType === "form") {
    return <PartnersFormView display={display.toUpperCase()} />;
  } else {
    return <NotFound />;
  }
}

export default PagePartners;
