import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET() {
  const userId = getUserId();
  const peptides = await prisma.peptide.findMany({
    where: { userId },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
  return NextResponse.json(peptides);
}
