import { Sidebar } from "./Sidebar";
import type { AppUser } from "@/types/database";

export function AppLayout({
  user,
  children,
}: {
  user: AppUser;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-ivory">
      <Sidebar user={user} />
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-8 md:py-12">{children}</div>
      </main>
    </div>
  );
}
