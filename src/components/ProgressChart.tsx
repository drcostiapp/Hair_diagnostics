export function ProgressChart({ scores }: { scores: number[] }) {
  if (scores.length === 0) {
    return (
      <div className="rounded-luxe border border-anchor/10 bg-ivory-warm p-6 text-center text-bronze text-sm">
        No simulations yet.
      </div>
    );
  }

  const max = 100;
  const w = 600;
  const h = 160;
  const padding = 20;
  const innerW = w - padding * 2;
  const innerH = h - padding * 2;

  const step = scores.length > 1 ? innerW / (scores.length - 1) : 0;
  const points = scores.map((s, i) => {
    const x = padding + i * step;
    const y = padding + innerH - (Math.min(max, Math.max(0, s)) / max) * innerH;
    return [x, y] as const;
  });

  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");

  return (
    <div className="rounded-luxe border border-anchor/10 bg-white p-5 shadow-quiet">
      <div className="text-[11px] tracking-luxe uppercase text-bronze mb-3">Score Trend</div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
        <line
          x1={padding}
          y1={padding + innerH - (90 / max) * innerH}
          x2={padding + innerW}
          y2={padding + innerH - (90 / max) * innerH}
          stroke="#D3B57C"
          strokeDasharray="3 4"
          strokeWidth={1}
        />
        <path d={path} fill="none" stroke="#0E2A37" strokeWidth={2} strokeLinecap="round" />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3.5} fill="#D3B57C" />
        ))}
      </svg>
      <div className="text-[10px] text-bronze text-right mt-1">Pass line: 90</div>
    </div>
  );
}
