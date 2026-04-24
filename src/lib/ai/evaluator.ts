import { openai } from "@/lib/openai";
import { env } from "@/lib/env";
import type { ChatMessage, EvaluatorPayload, Scenario } from "@/types/database";

const EVALUATOR_SYSTEM_PROMPT = `You are the evaluator for the Dr. Costi Experience Simulator.

Your job is to evaluate the trainee's performance against the Private Consultation luxury experience standard.

Score the trainee out of 100 using:

1. Tone & elegance: /25
Evaluate whether the language feels calm, refined, warm, and premium.

2. SOP accuracy: /25
Evaluate whether the trainee followed the correct operational details:
- $420 consultation fee
- $100 reservation fee
- Saturdays only/select Saturdays
- One-hour session
- Complete privacy
- Preference questionnaire 48h before
- Live location request morning-of
- Valet/hostess timing
- No chasing after non-response
- Correct follow-up logic

3. Brevity & control: /20
Evaluate whether the trainee avoided over-explaining, rambling, sounding desperate, or giving too much information.

4. Emotional intelligence: /20
Evaluate whether the trainee responded to hesitation, objection, impatience, or concern with calm understanding.

5. Luxury discipline: /10
Evaluate restraint, exclusivity, silence, confidence, and premium positioning.

Automatic fail triggers (if any one is clearly present, set pass_fail to "FAIL" regardless of raw total):
- Sounds salesy
- Discounts the experience
- Gives incorrect fee
- Chases a non-responsive client
- Over-explains
- Uses casual slang
- Makes the experience feel ordinary
- Reveals internal complexity
- Pressures the client
- Uses language inconsistent with luxury medicine

Passing threshold: final_score >= 90 AND no automatic-fail trigger.

You MUST return valid JSON matching exactly this shape, nothing else:
{
  "tone_score": number,
  "sop_score": number,
  "brevity_score": number,
  "emotional_score": number,
  "discipline_score": number,
  "final_score": number,
  "pass_fail": "PASS" or "FAIL",
  "luxury_violations": string[],
  "key_mistakes": string[],
  "best_response": string,
  "weakest_response": string,
  "corrected_responses": [
    { "original": string, "corrected": string, "why": string }
  ],
  "recommendation": string,
  "evaluator_summary": string
}

Rules:
- Sub-scores must be integers and never exceed their max.
- final_score must equal the sum of the five sub-scores.
- Be specific in "why" — cite the SOP rule or tone failure.
- Corrected responses must be luxury-discipline accurate and match the playbook.
- If the trainee did not respond at all, score zero and fail.`;

export interface EvaluatorInput {
  scenario: Scenario;
  transcript: Pick<ChatMessage, "sender" | "message">[];
}

function renderTranscript(transcript: EvaluatorInput["transcript"]): string {
  return transcript
    .map((m) => {
      const who =
        m.sender === "ai_client" ? "PATIENT" : m.sender === "trainee" ? "TRAINEE" : "SYSTEM";
      return `${who}: ${m.message}`;
    })
    .join("\n");
}

export async function runEvaluator(input: EvaluatorInput): Promise<EvaluatorPayload> {
  const { scenario, transcript } = input;

  const userContent = `SCENARIO
Title: ${scenario.title}
Category: ${scenario.category}
Difficulty: ${scenario.difficulty}/5
Role being tested: ${scenario.role_target}
Expected behavior: ${scenario.expected_behavior ?? "n/a"}
Gold-standard response (reference): ${scenario.gold_standard_response ?? "n/a"}
Known fail triggers: ${scenario.fail_triggers.join("; ") || "n/a"}

TRANSCRIPT
${renderTranscript(transcript)}

Return the JSON evaluation now.`;

  const completion = await openai().chat.completions.create({
    model: env.openaiEvaluatorModel(),
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: EVALUATOR_SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<EvaluatorPayload>;

  return normalizeEvaluation(parsed);
}

function clampInt(v: unknown, max: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(max, Math.round(n)));
}

function asStringArr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x)).filter(Boolean);
}

function normalizeEvaluation(raw: Partial<EvaluatorPayload>): EvaluatorPayload {
  const tone = clampInt(raw.tone_score, 25);
  const sop = clampInt(raw.sop_score, 25);
  const brevity = clampInt(raw.brevity_score, 20);
  const emotional = clampInt(raw.emotional_score, 20);
  const discipline = clampInt(raw.discipline_score, 10);
  const final = Math.min(100, tone + sop + brevity + emotional + discipline);
  const violations = asStringArr(raw.luxury_violations);

  const hasAutoFail = violations.length > 0;
  const explicitPass = raw.pass_fail === "PASS";
  const pass = explicitPass && final >= 90 && !hasAutoFail ? "PASS" : "FAIL";

  const corrected = Array.isArray(raw.corrected_responses)
    ? raw.corrected_responses
        .map((c) => ({
          original: String((c as { original?: unknown })?.original ?? ""),
          corrected: String((c as { corrected?: unknown })?.corrected ?? ""),
          why: String((c as { why?: unknown })?.why ?? ""),
        }))
        .filter((c) => c.corrected || c.original)
    : [];

  return {
    tone_score: tone,
    sop_score: sop,
    brevity_score: brevity,
    emotional_score: emotional,
    discipline_score: discipline,
    final_score: final,
    pass_fail: pass,
    luxury_violations: violations,
    key_mistakes: asStringArr(raw.key_mistakes),
    best_response: String(raw.best_response ?? ""),
    weakest_response: String(raw.weakest_response ?? ""),
    corrected_responses: corrected,
    recommendation: String(raw.recommendation ?? ""),
    evaluator_summary: String(raw.evaluator_summary ?? ""),
  };
}
