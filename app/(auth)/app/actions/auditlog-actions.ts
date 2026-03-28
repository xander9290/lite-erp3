"use server";

import { type AuditlogActions, type Auditlog } from "@/generated/prisma/client";
import { type UserWithPartner } from "../users/actions/user-actions";
import { ActionResponse } from "../../../libs/definitions";
import prisma from "../../../libs/prisma";
import { sessionStore } from "../../../libs/sessionStore";

export interface AuditLogWithProps extends Auditlog {
  User: UserWithPartner;
}

export async function createAuditlog({
  entityType,
  entityId,
  action,
  log,
}: {
  entityType: string;
  entityId: string;
  action: AuditlogActions;
  log: string;
}): Promise<ActionResponse<AuditLogWithProps | null>> {
  try {
    const { uid } = await sessionStore();
    if (!uid) throw new Error("ID SESSION NOT DEFINED");

    const newAuditlog = await prisma.auditlog.create({
      data: {
        entityType,
        entityId,
        action,
        log,
        User: { connect: { id: uid } },
      },
      include: {
        User: {
          include: {
            Partner: true,
          },
        },
      },
    });

    if (!newAuditlog) throw new Error("No fue posible crear el log");

    return {
      success: true,
      message: "Se ha creado el log",
      data: newAuditlog,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function getAuditlogsByEntity({
  entityType,
  entityId,
}: {
  entityType: string | null;
  entityId: string | null;
}): Promise<AuditLogWithProps[]> {
  try {
    if (!entityType || !entityId)
      throw new Error(
        "No fue posible encontrar el Auditor: parámetros no deifnidoso correctamente",
      );

    const auditlog = await prisma.auditlog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        User: {
          include: {
            Partner: true,
          },
        },
      },
    });

    if (!auditlog) throw new Error("No fue posible crear el auditor");

    return auditlog;
  } catch (error: any) {
    console.log(error);
    return [];
  }
}
