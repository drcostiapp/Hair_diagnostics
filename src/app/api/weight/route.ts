import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET() {
  const userId = getUserId();
  const entries = await prisma.weightEntry.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 90,
  });
  return NextResponse.json(entries);
}
