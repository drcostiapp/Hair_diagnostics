export type UserRole =
  | "manager"
  | "receptionist"
  | "whatsapp_agent"
  | "hostess"
  | "nurse"
  | "valet";

export type CertificationStatus =
  | "not_started"
  | "in_progress"
  | "certified"
  | "needs_retraining";

export type SimulationStatus = "in_progress" | "completed" | "abandoned";
export type PassFail = "PASS" | "FAIL";
export type MessageSender = "ai_client" | "trainee" | "system";

export interface AppUser {
  id: string;
  auth_id: string | null;
  name: string;
  email: string;
  role: UserRole;
  branch: string | null;
  status: "active" | "inactive" | "suspended";
  certification_status: CertificationStatus;
  created_at: string;
}

export interface Scenario {
  id: string;
  title: string;
  category: string;
  difficulty: number;
  role_target: string;
  scenario_context: string;
  client_personality: string | null;
  opening_message: string;
  expected_behavior: string | null;
  gold_standard_response: string | null;
  fail_triggers: string[];
  sop_reference: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Simulation {
  id: string;
  user_id: string;
  scenario_id: string;
  status: SimulationStatus;
  started_at: string;
  ended_at: string | null;
  final_score: number | null;
  pass_fail: PassFail | null;
  difficulty: number | null;
  notes: string | null;
}

export interface ChatMessage {
  id: string;
  simulation_id: string;
  sender: MessageSender;
  message: string;
  created_at: string;
}

export interface CorrectedResponse {
  original: string;
  corrected: string;
  why: string;
}

export interface Evaluation {
  id: string;
  simulation_id: string;
  tone_score: number | null;
  sop_score: number | null;
  brevity_score: number | null;
  emotional_score: number | null;
  discipline_score: number | null;
  final_score: number | null;
  pass_fail: PassFail | null;
  luxury_violations: string[];
  key_mistakes: string[];
  best_response: string | null;
  weakest_response: string | null;
  corrected_responses: CorrectedResponse[];
  recommendation: string | null;
  evaluator_summary: string | null;
  created_at: string;
}

export interface Certification {
  id: string;
  user_id: string;
  role: UserRole;
  required_scenarios_completed: number;
  average_score: number;
  certification_status: CertificationStatus;
  certified_at: string | null;
  manager_notes: string | null;
  updated_at: string;
}

export interface EvaluatorPayload {
  tone_score: number;
  sop_score: number;
  brevity_score: number;
  emotional_score: number;
  discipline_score: number;
  final_score: number;
  pass_fail: PassFail;
  luxury_violations: string[];
  key_mistakes: string[];
  best_response: string;
  weakest_response: string;
  corrected_responses: CorrectedResponse[];
  recommendation: string;
  evaluator_summary: string;
}
