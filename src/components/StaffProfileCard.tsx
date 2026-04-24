import { CertificationBadge } from "./CertificationBadge";
import { roleLabel } from "@/lib/format";
import type { AppUser, Certification } from "@/types/database";

export function StaffProfileCard({
  user,
  certification,
}: {
  user: AppUser;
  certification: Certification | null;
}) {
  return (
    <div className="rounded-luxe border border-anchor/10 bg-white p-6 shadow-quiet">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] tracking-luxe uppercase text-bronze">
            {roleLabel(user.role)}
          </div>
          <h2 className="font-display text-3xl text-anchor mt-1">{user.name}</h2>
          <div className="text-sm text-bronze mt-1">{user.email}</div>
          {user.branch && <div className="text-xs text-bronze/80 mt-0.5">{user.branch}</div>}
        </div>
        <CertificationBadge status={user.certification_status} />
      </div>

      {certification && (
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-[10px] tracking-luxe uppercase text-bronze">Avg Score</div>
            <div className="font-display text-3xl text-anchor mt-1">
              {certification.average_score ?? 0}
            </div>
          </div>
          <div>
            <div className="text-[10px] tracking-luxe uppercase text-bronze">Completed</div>
            <div className="font-display text-3xl text-anchor mt-1">
              {certification.required_scenarios_completed}
            </div>
          </div>
          <div>
            <div className="text-[10px] tracking-luxe uppercase text-bronze">Certified On</div>
            <div className="font-display text-lg text-anchor mt-2">
              {certification.certified_at
                ? new Date(certification.certified_at).toLocaleDateString()
                : "—"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
