import { z } from "zod";

export const EvaluatorOutputSchema = z.object({
  scores: z.object({
    tone_and_elegance: z.number().int().min(0).max(25),
    sop_accuracy: z.number().int().min(0).max(25),
    brevity_and_control: z.number().int().min(0).max(20),
    emotional_intelligence: z.number().int().min(0).max(20),
    luxury_discipline: z.number().int().min(0).max(10),
  }),
  auto_fail: z.boolean(),
  fail_reasons: z.array(z.string()).default([]),
  mistakes: z.array(z.string()).default([]),
  luxury_violations: z.array(z.string()).default([]),
  corrected_responses: z
    .array(
      z.object({
        trainee_said: z.string(),
        gold_standard: z.string(),
        why: z.string(),
      }),
    )
    .default([]),
  recommended_module: z.string(),
  summary: z.string(),
});

export type EvaluatorOutput = z.infer<typeof EvaluatorOutputSchema>;

export function parseEvaluatorJSON(raw: string): EvaluatorOutput {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Evaluator did not return JSON.");
  }
  const slice = cleaned.slice(start, end + 1);
  return EvaluatorOutputSchema.parse(JSON.parse(slice));
}
