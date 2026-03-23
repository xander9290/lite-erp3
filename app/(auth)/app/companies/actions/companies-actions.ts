"use server";

import type { Company, Partner } from "@/generated/prisma/client";
import { UserWithPartner } from "../../users/actions/user-actions";
import prisma from "@/app/libs/prisma";
import { ActionResponse } from "@/app/libs/definitions";
import { CompanySchemaType } from "../schemas/company.schema";
import { sessionStore } from "@/app/libs/sessionStore";
import { createAuditlog } from "@/app/actions/auditlog-actions";

export interface CompanieWithProps extends Company {
  Users: UserWithPartner[];
  Manager: UserWithPartner | null;
  Partner: Partner;
  Company: Company | null;
  Children: Company[];
}

export async function getCompanyById({
  id,
}: {
  id: string | null;
}): Promise<CompanieWithProps | null> {
  try {
    if (!id) throw new Error("ID not defined");

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        Users: {
          include: {
            Partner: true,
          },
        },
        Manager: {
          include: {
            Partner: true,
          },
        },
        Partner: true,
        Company: true,
        Children: true,
      },
    });

    return company;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

type CreateCompanyProps = Omit<
  CompanySchemaType,
  "createdUid" | "createdAt" | "updatedAt"
>;

export async function createCompany({
  data,
}: {
  data: CreateCompanyProps;
}): Promise<ActionResponse<CompanieWithProps>> {
  try {
    const { uid } = await sessionStore();

    const newCompany = await prisma.company.create({
      data: {
        name: `[${data.code}] ${data.name}`,
        code: data.code,
        active: data.active,
        Users: {
          connect: data.userIds.map((u) => ({ id: u })),
        },
        ...(data.managerId
          ? { Manager: { connect: { id: data.managerId } } }
          : {}),
        ...(data.parentId
          ? { Company: { connect: { id: data.parentId } } }
          : {}),
        Children: {
          connect: data.childrenIds.map((ch) => ({ id: ch.id })),
        },
        Partner: {
          create: {
            name: data.name,
            phone: data.phone,
            imageUrl: data.imageUrl,
            street: data.street,
            houseNumber: data.houseNumber,
            streets: data.street,
            zip: data.zip,
            town: data.town,
            county: data.county,
            province: data.province,
            country: data.country,
            vat: data.vat,
            createdUid: uid || "",
          },
        },
        createdUid: uid || "",
      },
      include: {
        Users: {
          include: {
            Partner: true,
          },
        },
        Manager: {
          include: {
            Partner: true,
          },
        },
        Partner: true,
        Company: true,
        Children: true,
      },
    });

    if (!newCompany) throw new Error("No fue posible crear la empresa");

    await createAuditlog({
      action: "create",
      entityId: newCompany.id,
      entityType: "companies",
      log: "Ha creado la empresa " + newCompany.name,
    });

    return {
      message: "Se ha creado la empresa",
      success: true,
      data: newCompany,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
