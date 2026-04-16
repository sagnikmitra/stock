import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const resources = await prisma.externalResource.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });

  return NextResponse.json({
    data: resources.map((resource) => ({
      key: resource.key,
      title: resource.title,
      url: resource.url,
      category: resource.category,
      provider: resource.provider,
      notes: resource.notes,
      createdAt: resource.createdAt.toISOString(),
    })),
  });
}
