import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { answerQuestion } from "@/lib/ai-engine";

export async function GET() {
  const userId = getUserId();
  const queries = await prisma.aIQuery.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { response: { select: { answer: true, confidence: true } } },
  });
  return NextResponse.json(queries);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { question } = body;

  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  const result = await answerQuestion(question);
  return NextResponse.json(result);
}
