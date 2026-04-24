export type StaffRole =
  | "receptionist"
  | "whatsapp_agent"
  | "hostess"
  | "nurse"
  | "valet"
  | "manager";

export type ScenarioCategory =
  | "whatsapp_inquiry"
  | "price_objection"
  | "vip_hesitation"
  | "booking_confirmation"
  | "live_location_request"
  | "arrival_issue"
  | "late_client"
  | "post_visit_follow_up"
  | "referral_conversation"
  | "fully_booked_saturday";

export type SimulationStatus = "in_progress" | "completed" | "abandoned";
export type MessageSender = "ai" | "trainee" | "system";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: StaffRole;
  is_manager: boolean;
  created_at: string;
}

export interface Scenario {
  id: string;
  title: string;
  category: ScenarioCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  description: string;
  client_persona: string;
  opening_message: string;
  gold_standard: string;
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
  completed_at: string | null;
  turn_count: number;
}

export interface Message {
  id: string;
  simulation_id: string;
  sender: MessageSender;
  content: string;
  created_at: string;
}

export interface CorrectedResponse {
  trainee_said: string;
  gold_standard: string;
  why: string;
}

export interface Evaluation {
  id: string;
  simulation_id: string;
  user_id: string;
  score_tone: number;
  score_sop: number;
  score_brevity: number;
  score_eq: number;
  score_luxury: number;
  total_score: number;
  auto_fail: boolean;
  passed: boolean;
  fail_reasons: string[];
  mistakes: string[];
  luxury_violations: string[];
  corrected_responses: CorrectedResponse[];
  recommended_module: string | null;
  created_at: string;
}

export const CATEGORY_LABELS: Record<ScenarioCategory, string> = {
  whatsapp_inquiry: "WhatsApp Inquiry",
  price_objection: "Price Objection",
  vip_hesitation: "VIP Hesitation",
  booking_confirmation: "Booking Confirmation",
  live_location_request: "Live Location Request",
  arrival_issue: "Arrival Issue",
  late_client: "Late Client",
  post_visit_follow_up: "Post-visit Follow-up",
  referral_conversation: "Referral Conversation",
  fully_booked_saturday: "Fully Booked Saturday",
};

export const ROLE_LABELS: Record<StaffRole, string> = {
  receptionist: "Receptionist",
  whatsapp_agent: "WhatsApp Agent",
  hostess: "Hostess",
  nurse: "Nurse",
  valet: "Valet",
  manager: "Manager",
};
