"use server";

import type { Partner } from "@/generated/prisma/client";
import { PartnerSchemaType } from "../schemas/partner.schema";
import { ActionResponse } from "@/app/libs/definitions";
import prisma from "@/app/libs/prisma";
import { createAuditlog } from "../../actions/auditlog-actions";

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

export async function updatePartner({
  data,
  id,
}: {
  data: PartnerActionProps;
  id: string | null;
}): Promise<ActionResponse<PartnerWithProps>> {
  try {
    if (!id) throw new Error("ID not defined");

    const updatedPartner = await prisma.partner.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        imageUrl: data.imageUrl,
        displayType: data.displayType,
        active: data.active,
        phone: data.phone,
        street: data.street,
        streets: data.streets,
        houseNumber: data.houseNumber,
        town: data.town,
        zip: data.zip,
        county: data.county,
        province: data.province,
        country: data.country,
        vat: data.vat,
        UserManager: data.userId?.id
          ? { connect: { id: data.userId.id } }
          : { disconnect: true },
      },
      include: {
        UserManager: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await createAuditlog({
      action: "update",
      entityId: updatedPartner.id,
      entityType: "partners",
      log: "Ha editado el registro",
    });

    return {
      success: true,
      message: "Se ha editado el registro",
      data: updatedPartner,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
