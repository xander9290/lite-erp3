"use server";

import { Tag } from "@/generated/prisma/client";
import { ActionResponse } from "../libs/definitions";
import prisma from "../libs/prisma";

export async function createTag({
  name,
}: {
  name: string | null;
}): Promise<ActionResponse<Tag>> {
  try {
    if (!name) throw new Error("No se ha especificado nombre");

    const newTag = await prisma.tag.create({
      data: { name },
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

export async function fetchTags(): Promise<Tag[]> {
  try {
    const tags = await prisma.tag.findMany({ take: 5 });

    return tags;
  } catch (error: any) {
    console.log(error);
    return [];
  }
}
