import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET() {
  const userId = getUserId();
  const protocols = await prisma.protocol.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
    include: { changes: { orderBy: { date: "desc" } } },
  });
  return NextResponse.json(protocols);
}
