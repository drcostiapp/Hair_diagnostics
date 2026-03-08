import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserId();
  const days = Number(req.nextUrl.searchParams.get("days") ?? 7);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const meals = await prisma.meal.findMany({
    where: { userId, date: { gte: since } },
    orderBy: { date: "desc" },
    include: { items: true },
  });
  return NextResponse.json(meals);
}
