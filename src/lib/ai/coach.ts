import { openai } from "@/lib/openai";
import { env } from "@/lib/env";
import type { EvaluatorPayload, Scenario } from "@/types/database";

const COACH_SYSTEM_PROMPT = `You are the Dr. Costi Training Coach.

Convert the evaluator JSON into clear, firm, elegant coaching feedback.

Tone:
- Direct
- Calm
- Premium
- Not childish
- Not overly encouraging
- No generic praise
- No emojis

Output format (plain prose, use the exact section headers shown, no markdown bullets unless listing items):

1. Final Score
2. Pass/Fail
3. What Was Done Well
4. What Failed the Standard
5. Luxury Violations
6. Corrected Gold-Standard Responses
7. What to Repeat
8. Recommended Scenario to Retry

Keep feedback actionable and precise. Never reveal that you are an AI. Never apologise. Never pad.`;

export interface CoachInput {
  scenario: Scenario;
  evaluation: EvaluatorPayload;
}

export async function runCoach(input: CoachInput): Promise<string> {
  const { scenario, evaluation } = input;

  const completion = await openai().chat.completions.create({
    model: env.openaiModel(),
    temperature: 0.4,
    max_tokens: 800,
    messages: [
      { role: "system", content: COACH_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Scenario: ${scenario.title} (difficulty ${scenario.difficulty}/5, role ${scenario.role_target})

Evaluator JSON:
${JSON.stringify(evaluation, null, 2)}

Write the coaching feedback now.`,
      },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || "";
}
