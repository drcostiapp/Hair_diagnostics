import { cn } from "@/lib/cn";

export function ScoreCard({
  label,
  value,
  max,
  emphasis = false,
}: {
  label: string;
  value: number | null | undefined;
  max: number;
  emphasis?: boolean;
}) {
  const v = typeof value === "number" ? value : 0;
  const pct = Math.min(100, Math.round((v / max) * 100));
  return (
    <div
      className={cn(
        "rounded-luxe border p-5 bg-ivory-warm",
        emphasis ? "border-champagne/70 shadow-quiet" : "border-anchor/10",
      )}
    >
      <div className="text-[11px] tracking-luxe uppercase text-bronze">{label}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <div className="font-display text-4xl text-anchor">{v}</div>
        <div className="text-sm text-bronze">/ {max}</div>
      </div>
      <div className="mt-3 h-[3px] bg-linen/60 rounded-full overflow-hidden">
        <div
          className={cn("h-full", emphasis ? "bg-champagne" : "bg-anchor/70")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
