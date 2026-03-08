import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  console.log("Seeding database...");

  // Create user
  const user = await prisma.user.upsert({
    where: { id: "default-user" },
    update: {},
    create: {
      id: "default-user",
      email: "me@vitalis.local",
      name: "Alex",
      profile: {
        create: {
          age: 34,
          sex: "male",
          height: 72,
          heightUnit: "in",
          activityLevel: "very_active",
          dietaryStyle: "High protein, moderate carb",
          sleepHabits: "7-8 hours, consistent schedule",
          medicalHistory: "No major conditions",
          allergies: "None known",
          diagnoses: "None",
        },
      },
    },
  });

  // Goals
  await prisma.goal.createMany({
    data: [
      { userId: user.id, title: "Reach 12% body fat", category: "body_composition", priority: 1 },
      { userId: user.id, title: "Improve deep sleep to 1.5+ hours", category: "recovery", priority: 2 },
      { userId: user.id, title: "Optimize testosterone naturally", category: "metabolic", priority: 3 },
    ],
    skipDuplicates: true,
  });

  // Supplements
  const supps = [
    { name: "Magnesium Glycinate", dosage: "400mg", frequency: "nightly", purpose: "Sleep, recovery", startDate: daysAgo(60) },
    { name: "Vitamin D3+K2", dosage: "5000IU / 100mcg", frequency: "daily", purpose: "Bone health, immune", startDate: daysAgo(90) },
    { name: "Omega-3 Fish Oil", dosage: "2g EPA/DHA", frequency: "daily", purpose: "Inflammation, cardiovascular", startDate: daysAgo(90) },
    { name: "Creatine Monohydrate", dosage: "5g", frequency: "daily", purpose: "Performance, cognition", startDate: daysAgo(45) },
    { name: "Ashwagandha KSM-66", dosage: "600mg", frequency: "daily", purpose: "Stress, cortisol", startDate: daysAgo(30) },
    { name: "Zinc Picolinate", dosage: "30mg", frequency: "daily", purpose: "Immune, testosterone", startDate: daysAgo(60) },
    { name: "Tongkat Ali", dosage: "400mg", frequency: "daily", purpose: "Testosterone optimization", startDate: daysAgo(21) },
  ];

  for (const s of supps) {
    await prisma.supplement.create({ data: { userId: user.id, ...s, active: true } });
  }

  // Peptides
  const peptides = [
    { name: "BPC-157", dosage: "250mcg", frequency: "2x daily", route: "subcutaneous", purpose: "Gut healing, tendon repair", startDate: daysAgo(14) },
    { name: "TB-500", dosage: "2.5mg", frequency: "2x/week", route: "subcutaneous", purpose: "Recovery, tissue repair", startDate: daysAgo(14) },
  ];

  for (const p of peptides) {
    await prisma.peptide.create({ data: { userId: user.id, ...p, active: true } });
  }

  // Protocols
  const protocol1 = await prisma.protocol.create({
    data: {
      userId: user.id,
      name: "BPC-157 + TB-500 Healing Stack",
      category: "peptide",
      description: "Combined peptide protocol for accelerated tendon and gut healing",
      dosage: "BPC-157 250mcg 2x/day + TB-500 2.5mg 2x/week",
      frequency: "Daily / 2x weekly",
      purpose: "Accelerate recovery from chronic tendinitis and improve gut lining",
      status: "active",
      startDate: daysAgo(14),
    },
  });

  await prisma.protocolChange.create({
    data: {
      protocolId: protocol1.id,
      date: daysAgo(7),
      changeType: "observation",
      description: "Noticing reduced joint stiffness in the morning",
      reason: "Subjective improvement tracking",
    },
  });

  const protocol2 = await prisma.protocol.create({
    data: {
      userId: user.id,
      name: "Sleep Optimization Phase",
      category: "sleep",
      description: "Multi-factor sleep improvement protocol",
      purpose: "Increase deep sleep and HRV",
      status: "active",
      startDate: daysAgo(30),
    },
  });

  // Daily Logs
  for (let i = 0; i < 30; i++) {
    const date = daysAgo(i);
    await prisma.dailyLog.upsert({
      where: { userId_date: { userId: user.id, date } },
      update: {},
      create: {
        userId: user.id,
        date,
        mood: 5 + Math.floor(Math.random() * 4),
        energy: 5 + Math.floor(Math.random() * 4),
        stress: 2 + Math.floor(Math.random() * 4),
        hydration: 2 + Math.random() * 2,
        steps: 6000 + Math.floor(Math.random() * 8000),
        notes: i === 0 ? "Good day overall, felt strong in the gym" : undefined,
      },
    });
  }

  // Sleep entries
  for (let i = 0; i < 30; i++) {
    await prisma.sleepEntry.create({
      data: {
        userId: user.id,
        date: daysAgo(i),
        bedtime: "22:30",
        wakeTime: "06:30",
        duration: 7 + Math.random() * 1.5,
        quality: 5 + Math.floor(Math.random() * 4),
        deepSleep: 0.8 + Math.random() * 0.8,
        remSleep: 1.2 + Math.random() * 0.8,
        hrv: 35 + Math.floor(Math.random() * 25),
        restingHr: 52 + Math.floor(Math.random() * 10),
      },
    });
  }

  // Weight entries
  let w = 185;
  for (let i = 30; i >= 0; i -= 2) {
    w += (Math.random() - 0.55) * 0.8;
    await prisma.weightEntry.create({
      data: { userId: user.id, date: daysAgo(i), weight: Math.round(w * 10) / 10 },
    });
  }

  // Body Composition
  await prisma.bodyCompositionEntry.create({
    data: {
      userId: user.id,
      date: daysAgo(28),
      weight: 185.2,
      bodyFat: 16.5,
      muscleMass: 148.0,
      visceralFat: 8,
      waist: 33.5,
      scanType: "InBody",
    },
  });
  await prisma.bodyCompositionEntry.create({
    data: {
      userId: user.id,
      date: daysAgo(0),
      weight: 183.8,
      bodyFat: 15.8,
      muscleMass: 149.2,
      visceralFat: 7,
      waist: 33.0,
      scanType: "InBody",
    },
  });

  // Meals
  const mealTemplates = [
    { mealType: "breakfast", description: "4 eggs, avocado, sourdough toast, berries", calories: 650, protein: 35, carbs: 45, fat: 38 },
    { mealType: "lunch", description: "Grilled chicken breast, rice, mixed vegetables, olive oil", calories: 780, protein: 52, carbs: 65, fat: 28 },
    { mealType: "dinner", description: "Salmon filet, sweet potato, asparagus, butter", calories: 720, protein: 45, carbs: 48, fat: 32 },
    { mealType: "snack", description: "Greek yogurt, honey, walnuts, protein shake", calories: 420, protein: 38, carbs: 30, fat: 16 },
    { mealType: "post-workout", description: "Whey protein, banana, oats", calories: 380, protein: 35, carbs: 48, fat: 6 },
  ];

  for (let i = 0; i < 7; i++) {
    const date = daysAgo(i);
    for (let j = 0; j < 3 + Math.floor(Math.random() * 2); j++) {
      const template = mealTemplates[j % mealTemplates.length];
      await prisma.meal.create({
        data: { userId: user.id, date, ...template },
      });
    }
  }

  // Symptoms
  await prisma.symptomEntry.create({
    data: { userId: user.id, date: daysAgo(3), symptom: "Mild bloating", severity: 4, triggers: "Large lunch portion", notes: "Resolved after 2 hours" },
  });
  await prisma.symptomEntry.create({
    data: { userId: user.id, date: daysAgo(5), symptom: "Shoulder stiffness", severity: 5, notes: "Left shoulder, morning only" },
  });
  await prisma.symptomEntry.create({
    data: { userId: user.id, date: daysAgo(1), symptom: "Low energy afternoon", severity: 3, triggers: "High carb lunch" },
  });
  await prisma.symptomEntry.create({
    data: { userId: user.id, date: daysAgo(8), symptom: "Headache", severity: 6, triggers: "Poor sleep night before" },
  });

  // Exercise
  const exercises = [
    { type: "strength", name: "Upper Body Push (Bench, OHP, Flies)", duration: 65, intensity: 8 },
    { type: "strength", name: "Lower Body (Squats, RDLs, Leg Press)", duration: 70, intensity: 9 },
    { type: "strength", name: "Upper Body Pull (Rows, Pullups, Curls)", duration: 60, intensity: 8 },
    { type: "cardio", name: "Zone 2 Incline Walk", duration: 45, intensity: 5 },
    { type: "hiit", name: "Bike Sprints", duration: 25, intensity: 9 },
  ];

  for (let i = 0; i < 14; i++) {
    if (i % 2 === 0 || Math.random() > 0.5) {
      const ex = exercises[i % exercises.length];
      await prisma.exerciseEntry.create({
        data: { userId: user.id, date: daysAgo(i), ...ex },
      });
    }
  }

  // Lab Panel
  await prisma.labPanel.create({
    data: {
      userId: user.id,
      name: "Comprehensive Blood Panel",
      date: daysAgo(14),
      provider: "Quest Diagnostics",
      results: {
        create: [
          { name: "Glucose", value: 88, unit: "mg/dL", refRangeLow: 65, refRangeHigh: 99 },
          { name: "Hemoglobin A1c", value: 5.1, unit: "%", refRangeLow: 4.0, refRangeHigh: 5.6 },
          { name: "Total Cholesterol", value: 195, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 200 },
          { name: "LDL", value: 110, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 100, flag: "high" },
          { name: "HDL", value: 62, unit: "mg/dL", refRangeLow: 40, refRangeHigh: 100 },
          { name: "Triglycerides", value: 85, unit: "mg/dL", refRangeLow: 0, refRangeHigh: 150 },
          { name: "Total Testosterone", value: 685, unit: "ng/dL", refRangeLow: 300, refRangeHigh: 1000 },
          { name: "Free Testosterone", value: 18.5, unit: "pg/mL", refRangeLow: 8.7, refRangeHigh: 25.1 },
          { name: "TSH", value: 1.8, unit: "mIU/L", refRangeLow: 0.4, refRangeHigh: 4.0 },
          { name: "Vitamin D", value: 52, unit: "ng/mL", refRangeLow: 30, refRangeHigh: 100 },
          { name: "Vitamin B12", value: 680, unit: "pg/mL", refRangeLow: 200, refRangeHigh: 900 },
          { name: "Ferritin", value: 95, unit: "ng/mL", refRangeLow: 30, refRangeHigh: 400 },
          { name: "CRP (hs)", value: 0.8, unit: "mg/L", refRangeLow: 0, refRangeHigh: 3.0 },
          { name: "Creatinine", value: 1.1, unit: "mg/dL", refRangeLow: 0.7, refRangeHigh: 1.3 },
          { name: "ALT", value: 28, unit: "U/L", refRangeLow: 7, refRangeHigh: 56 },
          { name: "AST", value: 24, unit: "U/L", refRangeLow: 10, refRangeHigh: 40 },
        ],
      },
    },
  });

  // Recommendations
  await prisma.recommendation.createMany({
    data: [
      {
        userId: user.id,
        category: "metabolic",
        priority: "this_week",
        confidence: "moderate",
        title: "Address Elevated LDL",
        description: "LDL at 110 mg/dL is slightly above optimal. Consider increasing omega-3 intake and adding more soluble fiber.",
        reasoning: "Latest lab panel shows LDL flagged high at 110 mg/dL (ref <100).",
        actionItems: ["Increase fish oil to 3g EPA/DHA", "Add 10g psyllium husk fiber daily", "Retest in 3 months"],
      },
      {
        userId: user.id,
        category: "recovery",
        priority: "this_week",
        confidence: "moderate",
        title: "Monitor BPC-157 Effects on Joint Stiffness",
        description: "You reported reduced morning stiffness 7 days into the BPC-157 protocol. Continue monitoring and log any changes.",
        reasoning: "Protocol change log shows positive subjective improvement.",
        actionItems: ["Log shoulder stiffness daily", "Rate morning joint mobility"],
      },
      {
        userId: user.id,
        category: "performance",
        priority: "this_month",
        confidence: "low",
        title: "Possible Meal-Energy Correlation",
        description: "Low afternoon energy was reported after high carb lunches. Consider testing a lower-carb midday meal.",
        reasoning: "Symptom entry correlates 'low energy afternoon' with 'high carb lunch' as trigger.",
        actionItems: ["Try protein-focused lunches for 5 days", "Track energy at 3pm", "Compare results"],
      },
    ],
  });

  // Notes
  await prisma.note.create({
    data: {
      userId: user.id,
      date: daysAgo(1),
      title: "Training observation",
      content: "Feeling noticeably stronger on compound lifts since starting creatine 6 weeks ago. Recovery between sets feels faster.",
      category: "training",
    },
  });

  console.log("Seed complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
