import type { UserRole } from "@/types/database";

export function roleLabel(role: UserRole | string): string {
  const map: Record<string, string> = {
    manager: "Manager",
    receptionist: "Receptionist",
    whatsapp_agent: "WhatsApp Agent",
    hostess: "Hostess",
    nurse: "Nurse",
    valet: "Valet",
  };
  return map[role] ?? role;
}

export function difficultyLabel(level: number): string {
  const map: Record<number, string> = {
    1: "Easy",
    2: "Normal",
    3: "Difficult",
    4: "VIP",
    5: "Pressure Test",
  };
  return map[level] ?? `Level ${level}`;
}

export function certificationLabel(status: string): string {
  const map: Record<string, string> = {
    not_started: "Not Started",
    in_progress: "In Training",
    certified: "Certified",
    needs_retraining: "Needs Retraining",
  };
  return map[status] ?? status;
}

export function formatClock(dt: string | Date): string {
  const d = typeof dt === "string" ? new Date(dt) : dt;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(dt: string | Date): string {
  const d = typeof dt === "string" ? new Date(dt) : dt;
  return d.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
}
