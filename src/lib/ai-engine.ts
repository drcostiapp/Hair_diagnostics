import { prisma } from "./prisma";
import { getUserId } from "./auth";

export async function gatherUserContext() {
  const userId = getUserId();
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const [
    user,
    profile,
    goals,
    recentLogs,
    recentMeals,
    recentSymptoms,
    recentSleep,
    recentExercise,
    recentWeight,
    activeSupplements,
    activePeptides,
    activeMedications,
    activeProtocols,
    recentLabs,
    bodyComp,
    notes,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.goal.findMany({ where: { userId, status: "active" } }),
    prisma.dailyLog.findMany({ where: { userId, date: { gte: thirtyDaysAgo } }, orderBy: { date: "desc" } }),
    prisma.meal.findMany({ where: { userId, date: { gte: sevenDaysAgo } }, orderBy: { date: "desc" } }),
    prisma.symptomEntry.findMany({ where: { userId, date: { gte: thirtyDaysAgo } }, orderBy: { date: "desc" } }),
    prisma.sleepEntry.findMany({ where: { userId, date: { gte: thirtyDaysAgo } }, orderBy: { date: "desc" } }),
    prisma.exerciseEntry.findMany({ where: { userId, date: { gte: thirtyDaysAgo } }, orderBy: { date: "desc" } }),
    prisma.weightEntry.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 10 }),
    prisma.supplement.findMany({ where: { userId, active: true } }),
    prisma.peptide.findMany({ where: { userId, active: true } }),
    prisma.medication.findMany({ where: { userId, active: true } }),
    prisma.protocol.findMany({ where: { userId, status: "active" }, include: { changes: true } }),
    prisma.labPanel.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 3, include: { results: true } }),
    prisma.bodyCompositionEntry.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 5 }),
    prisma.note.findMany({ where: { userId, date: { gte: thirtyDaysAgo } }, orderBy: { date: "desc" } }),
  ]);

  return buildContextString({
    user, profile, goals, recentLogs, recentMeals, recentSymptoms,
    recentSleep, recentExercise, recentWeight, activeSupplements,
    activePeptides, activeMedications, activeProtocols, recentLabs,
    bodyComp, notes,
  });
}

function buildContextString(data: Record<string, unknown>): string {
  const sections: string[] = [];

  const profile = data.profile as Record<string, unknown> | null;
  const user = data.user as Record<string, unknown> | null;
  if (profile || user) {
    sections.push(`## User Profile
Name: ${user?.name ?? "Unknown"}
Age: ${profile?.age ?? "Not set"}, Sex: ${profile?.sex ?? "Not set"}
Height: ${profile?.height ?? "?"} ${profile?.heightUnit ?? "in"}
Activity Level: ${profile?.activityLevel ?? "Not set"}
Dietary Style: ${profile?.dietaryStyle ?? "Not set"}
Medical History: ${profile?.medicalHistory ?? "None recorded"}
Allergies: ${profile?.allergies ?? "None recorded"}
Diagnoses: ${profile?.diagnoses ?? "None recorded"}`);
  }

  const goals = data.goals as Array<Record<string, unknown>>;
  if (goals?.length) {
    sections.push(`## Active Goals\n${goals.map(g => `- ${g.title}${g.description ? `: ${g.description}` : ""}`).join("\n")}`);
  }

  const supplements = data.activeSupplements as Array<Record<string, unknown>>;
  if (supplements?.length) {
    sections.push(`## Active Supplements\n${supplements.map(s => `- ${s.name} ${s.dosage ?? ""} ${s.frequency ?? ""} (${s.purpose ?? "general"})`).join("\n")}`);
  }

  const peptides = data.activePeptides as Array<Record<string, unknown>>;
  if (peptides?.length) {
    sections.push(`## Active Peptides\n${peptides.map(p => `- ${p.name} ${p.dosage ?? ""} via ${p.route ?? "?"} ${p.frequency ?? ""} (${p.purpose ?? "general"})`).join("\n")}`);
  }

  const medications = data.activeMedications as Array<Record<string, unknown>>;
  if (medications?.length) {
    sections.push(`## Active Medications\n${medications.map(m => `- ${m.name} ${m.dosage ?? ""} ${m.frequency ?? ""} (${m.purpose ?? ""})`).join("\n")}`);
  }

  const protocols = data.activeProtocols as Array<Record<string, unknown>>;
  if (protocols?.length) {
    sections.push(`## Active Protocols\n${protocols.map(p => {
      const changes = (p.changes as Array<Record<string, unknown>>) ?? [];
      let text = `- ${p.name} [${p.category}]: ${p.purpose ?? p.description ?? ""}. Dosage: ${p.dosage ?? "N/A"}, Freq: ${p.frequency ?? "N/A"}, Started: ${p.startDate}`;
      if (changes.length) text += `\n  Changes: ${changes.map(c => `${c.changeType}: ${c.description}`).join("; ")}`;
      return text;
    }).join("\n")}`);
  }

  const logs = data.recentLogs as Array<Record<string, unknown>>;
  if (logs?.length) {
    sections.push(`## Recent Daily Logs (last 30 days)\n${logs.slice(0, 14).map(l =>
      `${(l.date as Date).toISOString().split("T")[0]}: Mood=${l.mood ?? "?"}/10 Energy=${l.energy ?? "?"}/10 Stress=${l.stress ?? "?"}/10 Steps=${l.steps ?? "?"} Hydration=${l.hydration ?? "?"}L${l.notes ? ` Notes: ${l.notes}` : ""}`
    ).join("\n")}`);
  }

  const meals = data.recentMeals as Array<Record<string, unknown>>;
  if (meals?.length) {
    sections.push(`## Recent Meals (last 7 days)\n${meals.slice(0, 10).map(m =>
      `${(m.date as Date).toISOString().split("T")[0]} ${m.mealType}: ${m.description ?? "No desc"} ${m.calories ? `(${m.calories} cal P:${m.protein ?? "?"}g C:${m.carbs ?? "?"}g F:${m.fat ?? "?"}g)` : ""}`
    ).join("\n")}`);
  }

  const symptoms = data.recentSymptoms as Array<Record<string, unknown>>;
  if (symptoms?.length) {
    sections.push(`## Recent Symptoms (last 30 days)\n${symptoms.map(s =>
      `${(s.date as Date).toISOString().split("T")[0]}: ${s.symptom} (severity ${s.severity}/10)${s.triggers ? ` triggers: ${s.triggers}` : ""}`
    ).join("\n")}`);
  }

  const sleep = data.recentSleep as Array<Record<string, unknown>>;
  if (sleep?.length) {
    sections.push(`## Recent Sleep (last 30 days)\n${sleep.slice(0, 14).map(s =>
      `${(s.date as Date).toISOString().split("T")[0]}: ${s.duration ?? "?"}h quality=${s.quality ?? "?"}/10 bed=${s.bedtime ?? "?"} wake=${s.wakeTime ?? "?"}`
    ).join("\n")}`);
  }

  const exercise = data.recentExercise as Array<Record<string, unknown>>;
  if (exercise?.length) {
    sections.push(`## Recent Exercise (last 30 days)\n${exercise.slice(0, 14).map(e =>
      `${(e.date as Date).toISOString().split("T")[0]}: ${e.type} - ${e.name} ${e.duration ?? "?"}min intensity=${e.intensity ?? "?"}/10`
    ).join("\n")}`);
  }

  const weight = data.recentWeight as Array<Record<string, unknown>>;
  if (weight?.length) {
    sections.push(`## Recent Weight\n${weight.map(w =>
      `${(w.date as Date).toISOString().split("T")[0]}: ${w.weight} ${w.unit}`
    ).join("\n")}`);
  }

  const bodyComp = data.bodyComp as Array<Record<string, unknown>>;
  if (bodyComp?.length) {
    sections.push(`## Body Composition\n${bodyComp.map(b =>
      `${(b.date as Date).toISOString().split("T")[0]}: Weight=${b.weight ?? "?"}lbs BF=${b.bodyFat ?? "?"}% Muscle=${b.muscleMass ?? "?"}lbs Waist=${b.waist ?? "?"}in`
    ).join("\n")}`);
  }

  const labs = data.recentLabs as Array<Record<string, unknown>>;
  if (labs?.length) {
    sections.push(`## Recent Labs\n${labs.map(l => {
      const results = (l.results as Array<Record<string, unknown>>) ?? [];
      return `### ${l.name} (${(l.date as Date).toISOString().split("T")[0]})\n${results.map(r =>
        `  ${r.name}: ${r.value} ${r.unit}${r.flag ? ` [${r.flag}]` : ""} (ref: ${r.refRangeLow ?? "?"}-${r.refRangeHigh ?? "?"})`
      ).join("\n")}`;
    }).join("\n")}`);
  }

  return sections.join("\n\n");
}

export async function answerQuestion(question: string): Promise<{
  answer: string;
  reasoning: string;
  confidence: string;
  dataCited: string[];
}> {
  const context = await gatherUserContext();
  const userId = getUserId();

  const systemPrompt = `You are Vitalis, a careful and intelligent personal health strategist AI. You analyze the user's stored health data to provide insights, summaries, pattern detection, and practical recommendations.

RULES:
1. Base all answers on the provided data. Do not invent data.
2. Clearly distinguish between: observed data, inferred patterns, tentative hypotheses, recommendations, and medical red flags.
3. Never present speculation as fact.
4. State uncertainty when data is insufficient.
5. Flag concerning patterns for physician review.
6. Avoid reckless diagnoses or dangerous dosing advice.
7. Clearly label confidence levels: high, moderate, low.
8. When data is missing, note what additional data would help.
9. Format responses cleanly with markdown.
10. Be concise but thorough.

USER'S HEALTH DATA:
${context}`;

  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";
  const model = process.env.AI_MODEL || "gpt-4o";

  let answer: string;
  let reasoning = "";
  let confidence = "moderate";
  const dataCited: string[] = [];

  if (apiKey && apiKey !== "your-api-key-here") {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      const data = await response.json();
      answer = data.choices?.[0]?.message?.content ?? "Unable to generate a response.";
    } catch {
      answer = generateLocalAnswer(question, context);
    }
  } else {
    answer = generateLocalAnswer(question, context);
  }

  // Store the query
  await prisma.aIQuery.create({
    data: {
      userId,
      question,
      response: {
        create: { answer, reasoning, confidence, dataCited },
      },
    },
  });

  return { answer, reasoning, confidence, dataCited };
}

function generateLocalAnswer(question: string, context: string): string {
  const q = question.toLowerCase();
  const lines = context.split("\n");

  if (q.includes("supplement") && (q.includes("taking") || q.includes("current") || q.includes("active"))) {
    const suppSection = extractSection(lines, "Active Supplements");
    if (suppSection) return `## Current Active Supplements\n\n${suppSection}\n\n*Based on your stored supplement data.*`;
    return "You don't have any active supplements recorded. Add supplements in the Supplements & Peptides section.";
  }

  if (q.includes("peptide") && (q.includes("taking") || q.includes("current") || q.includes("active"))) {
    const pepSection = extractSection(lines, "Active Peptides");
    if (pepSection) return `## Current Active Peptides\n\n${pepSection}\n\n*Based on your stored peptide data.*`;
    return "You don't have any active peptides recorded.";
  }

  if (q.includes("sleep")) {
    const sleepSection = extractSection(lines, "Recent Sleep");
    if (sleepSection) {
      return `## Sleep Analysis\n\n${sleepSection}\n\n### Observations\n- Review the quality scores and duration patterns above.\n- Consider whether bedtime consistency correlates with quality.\n\n*Confidence: moderate — based on available sleep logs.*`;
    }
    return "No recent sleep data found. Start logging sleep entries to get analysis.";
  }

  if (q.includes("symptom")) {
    const symSection = extractSection(lines, "Recent Symptoms");
    if (symSection) return `## Recent Symptoms\n\n${symSection}\n\n*Review for patterns. Consider whether any symptoms correlate with dietary changes or new supplements.*`;
    return "No recent symptoms recorded.";
  }

  if (q.includes("lab") || q.includes("biomarker")) {
    const labSection = extractSection(lines, "Recent Labs");
    if (labSection) return `## Lab Results\n\n${labSection}\n\n*Any flagged values should be discussed with your physician.*`;
    return "No lab results on file. Add lab panels in the Labs section.";
  }

  if (q.includes("weight") || q.includes("body")) {
    const weightSection = extractSection(lines, "Recent Weight");
    const bodySection = extractSection(lines, "Body Composition");
    let result = "";
    if (weightSection) result += `## Weight History\n\n${weightSection}\n\n`;
    if (bodySection) result += `## Body Composition\n\n${bodySection}\n\n`;
    if (result) return result + "*Track trends over time for meaningful insights.*";
    return "No weight or body composition data found.";
  }

  if (q.includes("protocol")) {
    const protoSection = extractSection(lines, "Active Protocols");
    if (protoSection) return `## Active Protocols\n\n${protoSection}`;
    return "No active protocols found.";
  }

  if (q.includes("summarize") || q.includes("summary") || q.includes("status") || q.includes("overview")) {
    return generateSummary(context);
  }

  if (q.includes("recommend") || q.includes("prioritize") || q.includes("focus") || q.includes("suggest")) {
    return generateRecommendations(context);
  }

  if (q.includes("energy")) {
    const logSection = extractSection(lines, "Recent Daily Logs");
    if (logSection) return `## Energy Trends\n\n${logSection}\n\n*Look for patterns between energy levels and sleep quality, exercise, and meal timing.*`;
    return "No daily log data with energy ratings found.";
  }

  if (q.includes("meal") || q.includes("food") || q.includes("eat") || q.includes("nutrition") || q.includes("diet")) {
    const mealSection = extractSection(lines, "Recent Meals");
    if (mealSection) return `## Recent Nutrition\n\n${mealSection}`;
    return "No meal data recorded recently.";
  }

  if (q.includes("exercise") || q.includes("workout") || q.includes("training")) {
    const exSection = extractSection(lines, "Recent Exercise");
    if (exSection) return `## Recent Exercise\n\n${exSection}`;
    return "No recent exercise data.";
  }

  // Default: show summary
  return generateSummary(context);
}

function extractSection(lines: string[], header: string): string | null {
  const startIdx = lines.findIndex(l => l.includes(header));
  if (startIdx === -1) return null;
  const endIdx = lines.findIndex((l, i) => i > startIdx && l.startsWith("## "));
  const sectionLines = lines.slice(startIdx + 1, endIdx === -1 ? undefined : endIdx).filter(l => l.trim());
  return sectionLines.length > 0 ? sectionLines.join("\n") : null;
}

function generateSummary(context: string): string {
  const sections = context.split("## ").filter(Boolean);
  if (sections.length === 0) return "No data available yet. Start by setting up your profile and logging daily entries.";

  let summary = "## Health Status Summary\n\n";
  summary += "Here's an overview based on your stored data:\n\n";

  for (const section of sections) {
    const title = section.split("\n")[0].trim();
    const lines = section.split("\n").slice(1).filter(l => l.trim());
    if (lines.length > 0) {
      summary += `**${title}**: ${lines.length} entries recorded\n`;
    }
  }

  summary += "\n### Missing Data\n";
  const hasSection = (name: string) => context.includes(name);
  if (!hasSection("Active Supplements")) summary += "- No supplements tracked\n";
  if (!hasSection("Recent Sleep")) summary += "- No sleep data\n";
  if (!hasSection("Recent Labs")) summary += "- No lab results\n";
  if (!hasSection("Recent Daily Logs")) summary += "- No daily logs\n";
  if (!hasSection("Recent Exercise")) summary += "- No exercise data\n";
  if (!hasSection("Recent Meals")) summary += "- No meal data\n";

  summary += "\n*Add more data to get better insights and recommendations. Confidence: low-moderate depending on data completeness.*";
  return summary;
}

function generateRecommendations(context: string): string {
  let recs = "## Recommendations\n\n";
  recs += "*Based on your current data. These are suggestions, not medical advice.*\n\n";

  const hasLabs = context.includes("Recent Labs");
  const hasSleep = context.includes("Recent Sleep");
  const hasExercise = context.includes("Recent Exercise");
  const hasMeals = context.includes("Recent Meals");
  const hasSymptoms = context.includes("Recent Symptoms");

  recs += "### Immediate Actions\n";
  if (!hasLabs) recs += "- **Get baseline labs done** — comprehensive metabolic panel, lipid panel, CBC, thyroid, vitamin D, B12, iron panel, testosterone (if applicable). [High confidence]\n";
  if (!hasSleep) recs += "- **Start tracking sleep** — sleep quality is foundational to every other health metric. [High confidence]\n";

  recs += "\n### This Week\n";
  if (!hasExercise) recs += "- **Log your exercise sessions** — even brief entries help spot training patterns. [High confidence]\n";
  if (!hasMeals) recs += "- **Log meals for at least 3 days** — even rough calorie/macro estimates help identify nutritional gaps. [Moderate confidence]\n";
  if (hasSymptoms) recs += "- **Review symptom triggers** — check if any logged symptoms correlate with specific meals, supplements, or activities. [Moderate confidence]\n";

  recs += "\n### Longer Term\n";
  recs += "- Establish consistent logging habits to build enough data for meaningful trend detection.\n";
  recs += "- Consider periodic body composition scans (DEXA) for objective tracking.\n";
  recs += "- Schedule lab work every 3-6 months to track biomarker trends.\n";

  recs += "\n### Physician Review Flags\n";
  if (context.includes("[high]") || context.includes("[low]")) {
    recs += "- **You have flagged lab values** — discuss these with your healthcare provider.\n";
  } else {
    recs += "- No immediate red flags detected based on current data.\n";
  }

  return recs;
}

export async function generateRecommendationsFromData(): Promise<Array<{
  category: string;
  priority: string;
  confidence: string;
  title: string;
  description: string;
  reasoning: string;
  actionItems: string[];
}>> {
  const context = await gatherUserContext();
  const recommendations: Array<{
    category: string;
    priority: string;
    confidence: string;
    title: string;
    description: string;
    reasoning: string;
    actionItems: string[];
  }> = [];

  if (!context.includes("Recent Sleep")) {
    recommendations.push({
      category: "data-collection",
      priority: "this_week",
      confidence: "high",
      title: "Start Tracking Sleep",
      description: "Sleep data is missing. Quality sleep is foundational to recovery, cognition, and metabolic health.",
      reasoning: "No sleep entries found in the database.",
      actionItems: ["Log sleep duration and quality daily", "Track bedtime and wake time"],
    });
  }

  if (!context.includes("Recent Labs")) {
    recommendations.push({
      category: "medical",
      priority: "immediate",
      confidence: "high",
      title: "Get Baseline Lab Work",
      description: "No lab results on file. Baseline labs are essential for tracking health optimization progress.",
      reasoning: "No lab panels found in the database.",
      actionItems: ["Schedule comprehensive blood work", "Include CMP, CBC, lipids, thyroid, vitamin D, testosterone"],
    });
  }

  if (context.includes("[high]") || context.includes("[low]")) {
    recommendations.push({
      category: "medical",
      priority: "immediate",
      confidence: "high",
      title: "Review Flagged Lab Values",
      description: "One or more lab values are outside reference ranges. Discuss with your physician.",
      reasoning: "Flagged values detected in lab results.",
      actionItems: ["Schedule appointment with healthcare provider", "Bring latest lab results"],
    });
  }

  if (!context.includes("Recent Exercise")) {
    recommendations.push({
      category: "performance",
      priority: "this_week",
      confidence: "moderate",
      title: "Log Exercise Sessions",
      description: "No exercise data found. Tracking workouts helps identify optimal training patterns.",
      reasoning: "No exercise entries in the database.",
      actionItems: ["Log at least 3 workout sessions this week"],
    });
  }

  if (context.includes("Recent Symptoms") && context.includes("Recent Meals")) {
    recommendations.push({
      category: "investigation",
      priority: "this_week",
      confidence: "low",
      title: "Check Meal-Symptom Correlations",
      description: "You have both meal and symptom data. Look for patterns between what you eat and symptoms.",
      reasoning: "Both meal and symptom data present — potential correlations may exist.",
      actionItems: ["Use Ask My Data to query meal-symptom patterns", "Consider an elimination trial if patterns emerge"],
    });
  }

  return recommendations;
}
