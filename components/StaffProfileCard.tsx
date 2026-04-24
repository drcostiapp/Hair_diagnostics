import { CertificationBadge } from "@/components/CertificationBadge";

export function StaffProfileCard({ user }: { user: any }) {
  return (
    <div className="card">
      <h2>{user.name}</h2>
      <p className="muted">{user.email} · {user.role}</p>
      <p>Branch: {user.branch ?? "Main"}</p>
      <CertificationBadge status={user.certification_status ?? "not_started"} />
    </div>
  );
}
