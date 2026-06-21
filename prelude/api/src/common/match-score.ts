/**
 * MATCH_SCORE — pure helper used for the local fallback ranking.
 *
 *   0.30 * intent_alignment
 * + 0.20 * interest_similarity
 * + 0.20 * behavioral_compatibility
 * + 0.15 * reciprocity_likelihood
 * + 0.10 * diversity_boost
 * + 0.05 * exploration_noise
 *
 * The raw weighted score is then multiplied by a time-decay factor based on
 * how close we are to the event start_time.
 */

export interface MatchScoreFactors {
  intentAlignment: number; // 0..1
  interestSimilarity: number; // 0..1
  behavioralCompatibility: number; // 0..1
  reciprocityLikelihood: number; // 0..1
  diversityBoost: number; // 0..1
  explorationNoise: number; // 0..1
}

export const MATCH_WEIGHTS = {
  intentAlignment: 0.3,
  interestSimilarity: 0.2,
  behavioralCompatibility: 0.2,
  reciprocityLikelihood: 0.15,
  diversityBoost: 0.1,
  explorationNoise: 0.05,
} as const;

/** Weighted base score in [0, 1]. */
export function baseMatchScore(f: MatchScoreFactors): number {
  return (
    MATCH_WEIGHTS.intentAlignment * clamp01(f.intentAlignment) +
    MATCH_WEIGHTS.interestSimilarity * clamp01(f.interestSimilarity) +
    MATCH_WEIGHTS.behavioralCompatibility * clamp01(f.behavioralCompatibility) +
    MATCH_WEIGHTS.reciprocityLikelihood * clamp01(f.reciprocityLikelihood) +
    MATCH_WEIGHTS.diversityBoost * clamp01(f.diversityBoost) +
    MATCH_WEIGHTS.explorationNoise * clamp01(f.explorationNoise)
  );
}

/**
 * Time-decay multiplier as a function of minutes-until-start.
 * Anchors from the spec:
 *   T-48h -> 0.7, T-24h -> 1.0, T-6h -> 1.3, LIVE (<=0) -> 1.6
 * Linearly interpolated between anchors; clamped at the ends.
 */
export function timeDecayMultiplier(minutesUntilStart: number): number {
  // anchors in (minutesUntilStart, multiplier), ordered by descending time.
  const anchors: Array<[number, number]> = [
    [48 * 60, 0.7],
    [24 * 60, 1.0],
    [6 * 60, 1.3],
    [0, 1.6],
  ];

  // LIVE or past start.
  if (minutesUntilStart <= 0) return 1.6;
  // Earlier than 48h out: floor at 0.7.
  if (minutesUntilStart >= 48 * 60) return 0.7;

  for (let i = 0; i < anchors.length - 1; i++) {
    const [hi, hiMul] = anchors[i];
    const [lo, loMul] = anchors[i + 1];
    if (minutesUntilStart <= hi && minutesUntilStart >= lo) {
      const t = (hi - minutesUntilStart) / (hi - lo); // 0..1 toward lo
      return hiMul + t * (loMul - hiMul);
    }
  }
  return 1.0;
}

/** Final ranking score = base * time-decay. */
export function matchScore(
  factors: MatchScoreFactors,
  minutesUntilStart: number,
): number {
  return baseMatchScore(factors) * timeDecayMultiplier(minutesUntilStart);
}

/** Jaccard similarity of two interest lists in [0, 1]. */
export function interestSimilarity(a: string[], b: string[]): number {
  if (!a?.length && !b?.length) return 0;
  const setA = new Set(a.map((s) => s.toLowerCase()));
  const setB = new Set(b.map((s) => s.toLowerCase()));
  let inter = 0;
  for (const x of setA) if (setB.has(x)) inter++;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : inter / union;
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
