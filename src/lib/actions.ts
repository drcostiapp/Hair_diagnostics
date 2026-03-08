"use server";

import { prisma } from "./prisma";
import { getUserId } from "./auth";
import { revalidatePath } from "next/cache";

// ─── Daily Log ───────────────────────────────────────────────────────
export async function upsertDailyLog(data: {
  date: string;
  mood?: number;
  energy?: number;
  stress?: number;
  hydration?: number;
  steps?: number;
  bowelHealth?: string;
  recovery?: string;
  notes?: string;
}) {
  const userId = getUserId();
  const result = await prisma.dailyLog.upsert({
    where: { userId_date: { userId, date: new Date(data.date) } },
    update: { ...data, date: new Date(data.date) },
    create: { userId, ...data, date: new Date(data.date) },
  });
  revalidatePath("/");
  revalidatePath("/daily-log");
  return result;
}

// ─── Meals ───────────────────────────────────────────────────────────
export async function createMeal(data: {
  date: string;
  time?: string;
  mealType: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  notes?: string;
}) {
  const userId = getUserId();
  const result = await prisma.meal.create({
    data: { userId, ...data, date: new Date(data.date) },
  });
  revalidatePath("/");
  revalidatePath("/nutrition");
  return result;
}

export async function deleteMeal(id: string) {
  await prisma.meal.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/nutrition");
}

// ─── Symptoms ────────────────────────────────────────────────────────
export async function createSymptom(data: {
  date: string;
  time?: string;
  symptom: string;
  severity?: number;
  duration?: string;
  triggers?: string;
  notes?: string;
}) {
  const userId = getUserId();
  const result = await prisma.symptomEntry.create({
    data: { userId, ...data, date: new Date(data.date), severity: data.severity ?? 5 },
  });
  revalidatePath("/");
  return result;
}

// ─── Sleep ───────────────────────────────────────────────────────────
export async function createSleepEntry(data: {
  date: string;
  bedtime?: string;
  wakeTime?: string;
  duration?: number;
  quality?: number;
  deepSleep?: number;
  remSleep?: number;
  awakenings?: number;
  hrv?: number;
  restingHr?: number;
  notes?: string;
}) {
  const userId = getUserId();
  const result = await prisma.sleepEntry.create({
    data: { userId, ...data, date: new Date(data.date) },
  });
  revalidatePath("/");
  return result;
}

// ─── Exercise ────────────────────────────────────────────────────────
export async function createExercise(data: {
  date: string;
  time?: string;
  type: string;
  name: string;
  duration?: number;
  intensity?: number;
  calories?: number;
  notes?: string;
}) {
  const userId = getUserId();
  const result = await prisma.exerciseEntry.create({
    data: { userId, ...data, date: new Date(data.date) },
  });
  revalidatePath("/");
  return result;
}

// ─── Weight ──────────────────────────────────────────────────────────
export async function createWeightEntry(data: {
  date: string;
  weight: number;
  unit?: string;
  notes?: string;
}) {
  const userId = getUserId();
  const result = await prisma.weightEntry.create({
    data: { userId, ...data, date: new Date(data.date), unit: data.unit ?? "lbs" },
  });
  revalidatePath("/");
  revalidatePath("/body-metrics");
  return result;
}

// ─── Body Composition ────────────────────────────────────────────────
export async function createBodyComposition(data: {
  date: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  visceralFat?: number;
  waist?: number;
  scanType?: string;
  notes?: string;
}) {
  const userId = getUserId();
  const result = await prisma.bodyCompositionEntry.create({
    data: { userId, ...data, date: new Date(data.date) },
  });
  revalidatePath("/");
  revalidatePath("/body-metrics");
  return result;
}

// ─── Supplements ─────────────────────────────────────────────────────
export async function createSupplement(data: {
  name: string;
  brand?: string;
  dosage?: string;
  frequency?: string;
  purpose?: string;
  startDate?: string;
  notes?: string;
}) {
  const userId = getUserId();
  const result = await prisma.supplement.create({
    data: {
      userId,
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : null,
    },
  });
  revalidatePath("/");
  revalidatePath("/supplements-peptides");
  return result;
}

export async function toggleSupplement(id: string, active: boolean) {
  await prisma.supplement.update({
    where: { id },
    data: {
      active,
      endDate: active ? null : new Date(),
    },
  });
  revalidatePath("/");
  revalidatePath("/supplements-peptides");
}

export async function logSupplementIntake(data: {
  supplementId: string;
  date: string;
  time?: string;
  taken?: boolean;
  dosage?: string;
  notes?: string;
}) {
  const userId = getUserId();
  const result = await prisma.supplementLog.create({
    data: { userId, ...data, date: new Date(data.date), taken: data.taken ?? true },
  });
  revalidatePath("/");
  return result;
}

// ─── Peptides ────────────────────────────────────────────────────────
export async function createPeptide(data: {
  name: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  purpose?: string;
  startDate?: string;
  notes?: string;
}) {
  const userId = getUserId();
  const result = await prisma.peptide.create({
    data: {
      userId,
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : null,
    },
  });
  revalidatePath("/");
  revalidatePath("/supplements-peptides");
  return result;
}

export async function togglePeptide(id: string, active: boolean) {
  await prisma.peptide.update({
    where: { id },
    data: {
      active,
      endDate: active ? null : new Date(),
    },
  });
  revalidatePath("/");
  revalidatePath("/supplements-peptides");
}

export async function logPeptideIntake(data: {
  peptideId: string;
  date: string;
  time?: string;
  taken?: boolean;
  dosage?: string;
  site?: string;
  notes?: string;
}) {
  const userId = getUserId();
  const result = await prisma.peptideLog.create({
    data: { userId, ...data, date: new Date(data.date), taken: data.taken ?? true },
  });
  revalidatePath("/");
  return result;
}

// ─── Medications ─────────────────────────────────────────────────────
export async function createMedication(data: {
  name: string;
  dosage?: string;
  frequency?: string;
  prescriber?: string;
  purpose?: string;
  startDate?: string;
  notes?: string;
}) {
  const userId = getUserId();
  const result = await prisma.medication.create({
    data: {
      userId,
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : null,
    },
  });
  revalidatePath("/");
  return result;
}

// ─── Protocols ───────────────────────────────────────────────────────
export async function createProtocol(data: {
  name: string;
  category: string;
  description?: string;
  dosage?: string;
  frequency?: string;
  purpose?: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}) {
  const userId = getUserId();
  const result = await prisma.protocol.create({
    data: {
      userId,
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  });
  revalidatePath("/");
  revalidatePath("/protocols");
  return result;
}

export async function updateProtocolStatus(id: string, status: string) {
  await prisma.protocol.update({
    where: { id },
    data: {
      status,
      endDate: status === "stopped" ? new Date() : undefined,
    },
  });
  revalidatePath("/");
  revalidatePath("/protocols");
}

export async function addProtocolChange(data: {
  protocolId: string;
  date: string;
  changeType: string;
  description: string;
  reason?: string;
  notes?: string;
}) {
  const result = await prisma.protocolChange.create({
    data: { ...data, date: new Date(data.date) },
  });
  revalidatePath("/protocols");
  return result;
}

// ─── Labs ────────────────────────────────────────────────────────────
export async function createLabPanel(data: {
  name: string;
  date: string;
  provider?: string;
  notes?: string;
  results: Array<{
    name: string;
    value: number;
    unit: string;
    refRangeLow?: number;
    refRangeHigh?: number;
    flag?: string;
    notes?: string;
  }>;
}) {
  const userId = getUserId();
  const result = await prisma.labPanel.create({
    data: {
      userId,
      name: data.name,
      date: new Date(data.date),
      provider: data.provider,
      notes: data.notes,
      results: {
        create: data.results,
      },
    },
    include: { results: true },
  });
  revalidatePath("/");
  revalidatePath("/labs");
  return result;
}

// ─── Notes ───────────────────────────────────────────────────────────
export async function createNote(data: {
  date: string;
  title?: string;
  content: string;
  category?: string;
}) {
  const userId = getUserId();
  const result = await prisma.note.create({
    data: { userId, ...data, date: new Date(data.date) },
  });
  revalidatePath("/");
  return result;
}

// ─── Profile ─────────────────────────────────────────────────────────
export async function updateProfile(data: {
  name?: string;
  age?: number;
  sex?: string;
  height?: number;
  heightUnit?: string;
  activityLevel?: string;
  dietaryStyle?: string;
  sleepHabits?: string;
  medicalHistory?: string;
  familyHistory?: string;
  allergies?: string;
  diagnoses?: string;
}) {
  const userId = getUserId();
  if (data.name) {
    await prisma.user.update({ where: { id: userId }, data: { name: data.name } });
  }
  const profileData = { ...data };
  delete (profileData as Record<string, unknown>).name;

  const result = await prisma.userProfile.upsert({
    where: { userId },
    update: profileData,
    create: { userId, ...profileData },
  });
  revalidatePath("/");
  revalidatePath("/settings");
  return result;
}

// ─── Goals ───────────────────────────────────────────────────────────
export async function createGoal(data: {
  title: string;
  description?: string;
  category?: string;
  priority?: number;
  targetDate?: string;
}) {
  const userId = getUserId();
  const result = await prisma.goal.create({
    data: {
      userId,
      ...data,
      targetDate: data.targetDate ? new Date(data.targetDate) : null,
    },
  });
  revalidatePath("/settings");
  return result;
}
