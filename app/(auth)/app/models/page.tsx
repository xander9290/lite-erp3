import NotFound from "@/app/not-found";

async function PageModels({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { view_type: viewType, id } = await searchParams;

  if (viewType === "list") {
    return <h3>List View</h3>;
  } else if (viewType === "form") {
    return <h3>Form View</h3>;
  } else {
    return <NotFound />;
  }
}

export default PageModels;
