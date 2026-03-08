import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { generateRecommendationsFromData } from "@/lib/ai-engine";

export async function GET() {
  const userId = getUserId();
  const recs = await prisma.recommendation.findMany({
    where: { userId, dismissed: false, status: "active" },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(recs);
}

export async function POST() {
  const userId = getUserId();
  const recommendations = await generateRecommendationsFromData();

  // Clear old recommendations
  await prisma.recommendation.updateMany({
    where: { userId, status: "active" },
    data: { status: "archived" },
  });

  // Create new ones
  const created = await Promise.all(
    recommendations.map(r =>
      prisma.recommendation.create({
        data: { userId, ...r },
      })
    )
  );

  return NextResponse.json(created);
}
