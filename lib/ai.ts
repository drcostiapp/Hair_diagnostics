import OpenAI from "openai";
import {
  CLIENT_SIMULATOR_PROMPT,
  COACH_PROMPT,
  EVALUATOR_PROMPT,
  MARKETING_STRATEGIST_PROMPT
} from "@/lib/prompts";
import { EvaluationResult, MarketingReport, Scenario } from "@/lib/types";
import { enforceCertificationRules } from "@/lib/scoring";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateClientReply(params: {
  scenario: Scenario;
  transcript: { sender: string; message: string }[];
}) {
  const completion = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: CLIENT_SIMULATOR_PROMPT },
      {
        role: "user",
        content: JSON.stringify({
          scenario: params.scenario,
          transcript: params.transcript
        })
      }
    ],
    temperature: 0.8
  });

  return completion.output_text.trim();
}

export async function evaluateSimulation(payload: {
  scenario: Scenario;
  transcript: { sender: string; message: string }[];
}) {
  const completion = await client.responses.create({
    model: "gpt-4.1",
    response_format: { type: "json_object" },
    input: [
      { role: "system", content: EVALUATOR_PROMPT },
      {
        role: "user",
        content: JSON.stringify(payload)
      }
    ],
    temperature: 0.2
  });

  const parsed = JSON.parse(completion.output_text) as EvaluationResult;
  return enforceCertificationRules(parsed);
}

export async function analyzeMarketing(payload: {
  business: string;
  campaign_data: unknown;
  competitors?: unknown;
}): Promise<MarketingReport> {
  const completion = await client.responses.create({
    model: "gpt-4.1",
    input: [
      { role: "system", content: MARKETING_STRATEGIST_PROMPT },
      {
        role: "user",
        content: JSON.stringify({
          instruction:
            "Audit the campaign data and return ONLY a raw JSON object (no markdown, no code fences) with these keys exactly: " +
            "overall_marketing_score (0-100), competitive_advantage_score (0-100), " +
            "growth_potential_score (0-100), executive_summary (string), " +
            "immediate_actions (string[] for the next 7 days), " +
            "medium_term_actions (string[] for 30 days), " +
            "long_term_actions (string[] for 90 days+), " +
            "content_pillars (string[]), priority_actions (string[] of the top 5 ranked by impact).",
          ...payload
        })
      }
    ],
    temperature: 0.4
  });

  const raw = completion.output_text.trim().replace(/^```(?:json)?\s*|\s*```$/g, "");
  return JSON.parse(raw) as MarketingReport;
}

export async function buildCoachFeedback(evaluation: EvaluationResult) {
  const completion = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: COACH_PROMPT },
      { role: "user", content: JSON.stringify(evaluation) }
    ],
    temperature: 0.4
  });

  return completion.output_text;
}
