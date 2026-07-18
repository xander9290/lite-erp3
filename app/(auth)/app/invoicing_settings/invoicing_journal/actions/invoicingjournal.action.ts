"use server";

import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import { InvoicingJournal } from "@/generated/prisma/client";
import { InvoicingJournalSchemaType } from "../schema/invoicingjournal.schema";

export interface InvoicingJournalWithProps extends InvoicingJournal {
  Company: { id: string; name: string };
  Currency: { id: string; name: string } | null;
}

export async function getJournalById({
  id,
}: {
  id: string | null;
}): Promise<InvoicingJournalWithProps | null> {
  try {
    if (!id) throw new Error("ID journal not defined");

    const journal = await prisma.invoicingJournal.findUnique({
      where: {
        id,
      },
      include: {
        Company: {
          select: { id: true, name: true },
        },
        Currency: {
          select: { id: true, name: true },
        },
      },
    });

    return journal;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createInvoicingJournal({
  data,
}: {
  data: InvoicingJournalSchemaType;
}): Promise<ActionResponse<InvoicingJournalWithProps>> {
  try {
    const newJournal = await prisma.invoicingJournal.create({
      data: {
        code: data.code,
        name: data.name,
        companyId: data.companyId.id,
        currencyId: data.currencyId?.id ? data.currencyId.id : null,
      },
      include: {
        Company: {
          select: { id: true, name: true },
        },
        Currency: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      success: true,
      message: "Se ha creado el registro",
      data: newJournal,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function updateInvoicingJournal({
  data,
  id,
}: {
  data: InvoicingJournalSchemaType;
  id: string | null;
}): Promise<ActionResponse<InvoicingJournalWithProps>> {
  try {
    if (!id) throw new Error("ID journal not defined");

    const newJournal = await prisma.invoicingJournal.update({
      where: {
        id,
      },
      data: {
        code: data.code,
        name: data.name,
        companyId: data.companyId.id,
        currencyId: data.currencyId?.id ? data.currencyId.id : null,
      },
      include: {
        Company: {
          select: { id: true, name: true },
        },
        Currency: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      success: true,
      message: "Se ha creado el registro",
      data: newJournal,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
