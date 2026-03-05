import prisma from "@/app/libs/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ model: string }> },
) {
  const { model } = await context.params;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const search = searchParams.get("search") ?? "";
  const limit = Number(searchParams.get("limit") ?? 8);

  // 🔥 acceso dinámico al modelo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelDelegate = (prisma as any)[model];

  if (!modelDelegate) {
    return NextResponse.json(
      { error: "Model not found in Prisma" },
      { status: 400 },
    );
  }

  if (id) {
    const record = await modelDelegate.findUnique({
      where: { id: String(id) },
      select: { id: true, name: true },
    });

    return NextResponse.json(record);
  }

  const results = await modelDelegate.findMany({
    where: {
      OR: [{ name: { contains: search, mode: "insensitive" } }],
    },
    take: limit,
    select: {
      id: true,
      name: true,
    },
  });

  return NextResponse.json(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    results.map((r: any) => ({
      id: r.id,
      name: r.name,
    })),
  );
}
