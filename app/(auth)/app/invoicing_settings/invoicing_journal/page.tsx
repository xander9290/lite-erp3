import NotFound from "@/app/not-found";
import { Metadata } from "next/types";
import { lazy } from "react";
import { getJournalById } from "./actions/invoicingjournal.action";

export const metadata: Metadata = {
  title: "Facturación -> Diarios",
};

const InvoicingJournalListView = lazy(
  () => import("./views/InvoicingJournalListView"),
);

const InvoicingJournalFormView = lazy(
  () => import("./views/InvoicingJournalFormView"),
);

async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { id, view_type: viewType } = await searchParams;

  const journal = id && id !== "null" ? await getJournalById({ id }) : null;

  if (viewType === "list") {
    return <InvoicingJournalListView />;
  } else if (viewType === "form") {
    return <InvoicingJournalFormView id={id} journal={journal} />;
  } else {
    return <NotFound />;
  }
}

export default page;
