import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET() {
  const userId = getUserId();
  const panels = await prisma.labPanel.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: { results: true },
  });
  return NextResponse.json(panels);
}
