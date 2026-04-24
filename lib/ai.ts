import OpenAI from "openai";
import { CLIENT_SIMULATOR_PROMPT, COACH_PROMPT, EVALUATOR_PROMPT } from "@/lib/prompts";
import { EvaluationResult, Scenario } from "@/lib/types";
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
