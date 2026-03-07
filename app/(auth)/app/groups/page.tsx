import NotFound from "@/app/not-found";
import { lazy } from "react";
import { getGroupById } from "./actions/groups-actions";

const GroupListView = lazy(() => import("./views/GroupListView"));
const GroupFormView = lazy(() => import("./views/GroupFormView"));

async function PageGroups({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { id, view_type: viewType } = await searchParams;

  const group = id && id !== "null" ? await getGroupById({ id }) : null;

  if (viewType === "list") {
    return <GroupListView />;
  } else if (viewType === "form") {
    return <GroupFormView id={id} group={group} />;
  } else {
    return <NotFound />;
  }
}

export default PageGroups;
