export function CertificationBadge({ status }: { status: string }) {
  const bg = status === "certified" ? "#d3b57c" : "#dbccbb";
  return <span style={{ background: bg, padding: ".35rem .65rem", borderRadius: 999 }}>{status}</span>;
}
