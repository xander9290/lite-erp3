"use server";

import type { Company, Partner } from "@/generated/prisma/client";
import prisma from "@/app/libs/prisma";
import { ActionResponse } from "@/app/libs/definitions";
import { CompanySchemaType } from "../schemas/company.schema";
import { sessionStore } from "@/app/libs/sessionStore";
import { createAuditlog } from "@/app/(auth)/app/actions/auditlog-actions";

export interface CompanieWithProps extends Company {
  Users: {
    id: string;
    name: string;
  }[];
  Manager: {
    name: string;
    id: string;
  } | null;
  Partner: Partner;
  Company: {
    id: string;
    name: string;
  } | null;
  Children: {
    name: string;
    id: string;
    Manager: {
      id: string;
      name: string;
    } | null;
  }[];
}

export async function getCompanyById({
  id,
}: {
  id: string | null;
}): Promise<CompanieWithProps | null> {
  try {
    if (!id) throw new Error("ID not defined");

    // const company = await prisma.company.findUnique({
    //   where: { id },
    //   include: {
    //     Users: {
    //       include: {
    //         Partner: true,
    //       },
    //     },
    //     Manager: {
    //       include: {
    //         Partner: true,
    //       },
    //     },
    //     Partner: true,
    //     Company: true,
    //     Children: true,
    //   },
    // });

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        Users: {
          select: { id: true, name: true },
        },
        Partner: true,
        Company: {
          select: { id: true, name: true },
        },
        Manager: {
          select: {
            id: true,
            name: true,
          },
        },
        Children: {
          select: {
            id: true,
            name: true,
            Manager: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return company;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

type CompanyActionProps = Omit<
  CompanySchemaType,
  "createdUid" | "createdAt" | "updatedAt"
>;

export async function createCompany({
  data,
}: {
  data: CompanyActionProps;
}): Promise<ActionResponse<CompanieWithProps>> {
  try {
    const { uid } = await sessionStore();

    const newCompany = await prisma.company.create({
      data: {
        name: data.name,
        code: data.code,
        active: data.active,
        Users: {
          connect: data.userIds.map((u) => ({ id: u.id })),
        },
        ...(data.managerId
          ? { Manager: { connect: { id: data.managerId.id! } } }
          : {}),
        ...(data.parentId
          ? { Company: { connect: { id: data.parentId.id! } } }
          : {}),
        Children: {
          connect: data.childrenIds.map((ch) => ({ id: ch.companyId.id })),
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
          select: { id: true, name: true },
        },
        Partner: true,
        Company: {
          select: { id: true, name: true },
        },
        Manager: {
          select: {
            id: true,
            name: true,
          },
        },
        Children: {
          select: {
            id: true,
            name: true,
            Manager: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
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

export async function updateCompany({
  data,
}: {
  data: CompanyActionProps & { id: string | null };
}): Promise<ActionResponse<CompanieWithProps>> {
  try {
    if (!data.id) throw new Error("ID not defined");

    const updatedCompany = await prisma.company.update({
      where: { id: data.id },
      data: {
        name: data.name,
        code: data.code,
        active: data.active,
        Users: {
          set: data.userIds.map((u) => ({ id: u.id })),
        },
        Manager: data.managerId?.id
          ? { connect: { id: data.managerId.id } }
          : { disconnect: true },
        Company: data.parentId?.id
          ? { connect: { id: data.parentId.id } }
          : { disconnect: true },
        Children: {
          set: data.childrenIds.map((ch) => ({ id: ch.companyId.id })),
        },
        Partner: {
          update: {
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
          },
        },
      },
      include: {
        Users: {
          select: { id: true, name: true },
        },
        Partner: true,
        Company: {
          select: { id: true, name: true },
        },
        Manager: {
          select: {
            id: true,
            name: true,
          },
        },
        Children: {
          select: {
            id: true,
            name: true,
            Manager: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!updatedCompany) throw new Error("No fue posible editar la empresa");

    await createAuditlog({
      action: "update",
      entityId: updatedCompany.id,
      entityType: "companies",
      log: "Ha editado la empresa " + updatedCompany.name,
    });

    return {
      message: "Se ha creado la empresa",
      success: true,
      data: updatedCompany,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}
