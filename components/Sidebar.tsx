import Link from "next/link";

const links = [
  ["/dashboard", "Dashboard"],
  ["/scenarios", "Scenario Library"],
  ["/manager", "Manager View"],
  ["/profile/me", "Staff Profile"]
];

export function Sidebar() {
  return (
    <aside style={{ background: "#0e2a37", color: "#fff", padding: "1.5rem" }}>
      <h2 style={{ marginTop: 0, color: "#d3b57c" }}>DR. COSTI</h2>
      <p style={{ opacity: 0.85, fontSize: 14 }}>Experience Simulator</p>
      <nav style={{ display: "grid", gap: ".5rem", marginTop: "2rem" }}>
        {links.map(([href, label]) => (
          <Link key={href} href={href} style={{ padding: ".6rem .7rem", borderRadius: 10, background: "rgba(255,255,255,.06)" }}>
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
