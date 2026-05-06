"use server";

import { Tag } from "@/generated/prisma/client";
import { ActionResponse } from "../../../libs/definitions";
import prisma from "../../../libs/prisma";

export async function createTag({
  name,
  entityName,
}: {
  name: string | null;
  entityName: string | null;
}): Promise<ActionResponse<Tag>> {
  try {
    if (!name || !entityName) throw new Error("No se ha especificado nombre");

    const newTag = await prisma.tag.create({
      data: { name, entityName },
    });

    if (!newTag) throw new Error("Error al crar etiqueta");

    return {
      success: true,
      message: "Se ha creado la etiqueta",
      data: newTag,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function fetchTags({
  entityName,
}: {
  entityName: string | null;
}): Promise<Tag[]> {
  try {
    if (!entityName) throw new Error("Entity name not defined over fetchTags");

    const tags = await prisma.tag.findMany({
      where: { entityName },
    });

    return tags;
  } catch (error: any) {
    console.log(error);
    return [];
  }
}
