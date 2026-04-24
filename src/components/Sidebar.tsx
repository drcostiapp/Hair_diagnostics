"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import type { AppUser } from "@/types/database";
import { roleLabel, certificationLabel } from "@/lib/format";

interface NavItem {
  href: string;
  label: string;
  managerOnly?: boolean;
}

const STAFF_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/scenarios", label: "Scenario Library" },
];

const MANAGER_NAV: NavItem[] = [
  { href: "/manager", label: "Manager Dashboard" },
  { href: "/scenarios", label: "Scenario Library" },
];

export function Sidebar({ user }: { user: AppUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = user.role === "manager" ? MANAGER_NAV : STAFF_NAV;

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex md:flex-col w-64 min-h-screen bg-anchor text-ivory/90 border-r border-anchor-soft">
      <div className="px-6 py-8">
        <div className="text-[11px] tracking-luxe text-champagne uppercase">Dr. Costi</div>
        <div className="font-display text-2xl leading-tight mt-1">
          Experience
          <br />
          Simulator
        </div>
      </div>

      <nav className="flex-1 px-3">
        {nav.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-4 py-2.5 text-sm rounded-luxe transition-all",
                active
                  ? "bg-anchor-soft text-ivory border-l-2 border-champagne"
                  : "text-ivory/70 hover:text-ivory hover:bg-anchor-soft/50",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-6 border-t border-anchor-soft">
        <div className="text-[11px] tracking-luxe text-champagne uppercase">
          {roleLabel(user.role)}
        </div>
        <div className="font-display text-lg mt-1 text-ivory">{user.name}</div>
        <div className="text-xs text-ivory/50 mt-1">{user.email}</div>
        <div className="mt-3 text-xs text-ivory/70">
          {certificationLabel(user.certification_status)}
        </div>
        <button
          onClick={signOut}
          className="mt-5 text-xs text-ivory/50 hover:text-champagne transition-colors tracking-wide"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
