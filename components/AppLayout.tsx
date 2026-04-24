import { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh" }}>
      <Sidebar />
      <main className="container">{children}</main>
    </div>
  );
}
