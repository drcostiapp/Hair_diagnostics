import { cn } from "@/lib/cn";
import { certificationLabel } from "@/lib/format";
import type { CertificationStatus } from "@/types/database";

const styles: Record<CertificationStatus, string> = {
  not_started: "bg-linen/60 text-bronze border-bronze/20",
  in_progress: "bg-ivory-warm text-anchor border-anchor/20",
  certified: "bg-champagne/20 text-anchor border-champagne",
  needs_retraining: "bg-[#FBECEC] text-[#7A2E2E] border-[#E9C9C9]",
};

export function CertificationBadge({ status }: { status: CertificationStatus | string }) {
  const s = (status as CertificationStatus) in styles ? (status as CertificationStatus) : "not_started";
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 text-[11px] tracking-luxe uppercase rounded-full border",
        styles[s],
      )}
    >
      {certificationLabel(status)}
    </span>
  );
}
