import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET() {
  const userId = getUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) return NextResponse.json(null);

  return NextResponse.json({
    name: user.name,
    age: user.profile?.age,
    sex: user.profile?.sex,
    height: user.profile?.height,
    heightUnit: user.profile?.heightUnit ?? "in",
    activityLevel: user.profile?.activityLevel,
    dietaryStyle: user.profile?.dietaryStyle,
    sleepHabits: user.profile?.sleepHabits,
    medicalHistory: user.profile?.medicalHistory,
    familyHistory: user.profile?.familyHistory,
    allergies: user.profile?.allergies,
    diagnoses: user.profile?.diagnoses,
  });
}
