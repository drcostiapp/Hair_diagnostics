import OpenAI from "openai";
import { env } from "@/lib/env";

let cached: OpenAI | null = null;

export function openai(): OpenAI {
  if (cached) return cached;
  cached = new OpenAI({ apiKey: env.openaiApiKey() });
  return cached;
}
