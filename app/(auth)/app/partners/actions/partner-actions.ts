"use server";

import type { Partner } from "@/generated/prisma/client";
import { PartnerSchemaType } from "../schemas/partner.schema";
import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import { UserWithProps } from "../../users/actions/user-actions";

export interface PartnerWithProps extends Partner {
  UserManager: {
    id: string;
    name: string;
  } | null;
}

type PartnerActionProps = Omit<
  PartnerSchemaType,
  "createdAt" | "updatedAt" | "createdUid"
>;

export async function getPartnerById({
  id,
}: {
  id: string | null;
}): Promise<PartnerWithProps | null> {
  try {
    if (!id) throw new Error("ID not defined");

    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        UserManager: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return partner;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}
