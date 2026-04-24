export type UserRole = "manager" | "receptionist" | "whatsapp_agent" | "hostess" | "nurse" | "valet";

export type SimulationSender = "ai_client" | "trainee" | "system";

export interface Scenario {
  id: string;
  title: string;
  category: string;
  difficulty: number;
  role_target: UserRole;
  scenario_context: string;
  client_personality: string;
  opening_message: string;
  expected_behavior: string;
  gold_standard_response: string;
  fail_triggers: string[];
  sop_reference: string;
}

export interface EvaluationResult {
  tone_score: number;
  sop_score: number;
  brevity_score: number;
  emotional_score: number;
  discipline_score: number;
  final_score: number;
  pass_fail: "PASS" | "FAIL";
  luxury_violations: string[];
  key_mistakes: string[];
  best_response: string;
  weakest_response: string;
  corrected_responses: { original: string; corrected: string; why: string }[];
  recommendation: string;
  evaluator_summary: string;
}
