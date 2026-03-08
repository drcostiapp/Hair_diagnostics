import { prisma } from "./prisma";
import { getUserId } from "./auth";

export async function getDashboardData() {
  const userId = getUserId();
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [
    user,
    activeSupplements,
    activePeptides,
    activeMedications,
    activeProtocols,
    recentMeals,
    recentSymptoms,
    recentSleep,
    recentWeight,
    recentExercise,
    recentLogs,
    recentLabs,
    recommendations,
    weightHistory,
    sleepHistory,
    energyHistory,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { profile: true } }),
    prisma.supplement.findMany({ where: { userId, active: true }, orderBy: { name: "asc" } }),
    prisma.peptide.findMany({ where: { userId, active: true }, orderBy: { name: "asc" } }),
    prisma.medication.findMany({ where: { userId, active: true }, orderBy: { name: "asc" } }),
    prisma.protocol.findMany({ where: { userId, status: "active" }, orderBy: { startDate: "desc" } }),
    prisma.meal.findMany({ where: { userId, date: { gte: sevenDaysAgo } }, orderBy: { date: "desc" }, take: 5 }),
    prisma.symptomEntry.findMany({ where: { userId, date: { gte: sevenDaysAgo } }, orderBy: { date: "desc" }, take: 10 }),
    prisma.sleepEntry.findMany({ where: { userId, date: { gte: sevenDaysAgo } }, orderBy: { date: "desc" }, take: 7 }),
    prisma.weightEntry.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 1 }),
    prisma.exerciseEntry.findMany({ where: { userId, date: { gte: sevenDaysAgo } }, orderBy: { date: "desc" }, take: 5 }),
    prisma.dailyLog.findMany({ where: { userId, date: { gte: sevenDaysAgo } }, orderBy: { date: "desc" }, take: 7 }),
    prisma.labPanel.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 1, include: { results: true } }),
    prisma.recommendation.findMany({ where: { userId, dismissed: false, status: "active" }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.weightEntry.findMany({ where: { userId, date: { gte: thirtyDaysAgo } }, orderBy: { date: "asc" } }),
    prisma.sleepEntry.findMany({ where: { userId, date: { gte: thirtyDaysAgo } }, orderBy: { date: "asc" } }),
    prisma.dailyLog.findMany({ where: { userId, date: { gte: thirtyDaysAgo }, energy: { not: null } }, orderBy: { date: "asc" } }),
  ]);

  const latestWeight = recentWeight[0]?.weight;
  const avgSleepQuality = recentSleep.length > 0
    ? recentSleep.reduce((sum, s) => sum + (s.quality ?? 0), 0) / recentSleep.filter(s => s.quality).length || 0
    : null;
  const avgEnergy = recentLogs.length > 0
    ? recentLogs.reduce((sum, l) => sum + (l.energy ?? 0), 0) / recentLogs.filter(l => l.energy).length || 0
    : null;
  const avgMood = recentLogs.length > 0
    ? recentLogs.reduce((sum, l) => sum + (l.mood ?? 0), 0) / recentLogs.filter(l => l.mood).length || 0
    : null;

  return {
    user,
    metrics: {
      currentWeight: latestWeight,
      avgSleepQuality: avgSleepQuality ? Math.round(avgSleepQuality * 10) / 10 : null,
      avgEnergy: avgEnergy ? Math.round(avgEnergy * 10) / 10 : null,
      avgMood: avgMood ? Math.round(avgMood * 10) / 10 : null,
      activeSupplementCount: activeSupplements.length,
      activePeptideCount: activePeptides.length,
      activeProtocolCount: activeProtocols.length,
      exerciseSessionsThisWeek: recentExercise.length,
      symptomCountThisWeek: recentSymptoms.length,
    },
    activeSupplements,
    activePeptides,
    activeMedications,
    activeProtocols,
    recentMeals,
    recentSymptoms,
    recentSleep,
    recentExercise,
    recentLogs,
    recentLabs,
    recommendations,
    charts: {
      weight: weightHistory.map(w => ({ date: w.date.toISOString().split("T")[0], value: w.weight })),
      sleep: sleepHistory.map(s => ({ date: s.date.toISOString().split("T")[0], quality: s.quality, duration: s.duration })),
      energy: energyHistory.map(l => ({ date: l.date.toISOString().split("T")[0], value: l.energy })),
    },
  };
}
