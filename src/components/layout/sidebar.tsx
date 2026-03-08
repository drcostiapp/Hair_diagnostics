"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  UtensilsCrossed,
  Pill,
  FlaskConical,
  Scale,
  ClipboardList,
  Clock,
  MessageSquare,
  Settings,
  Activity,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/daily-log", label: "Daily Log", icon: CalendarDays },
  { href: "/nutrition", label: "Nutrition", icon: UtensilsCrossed },
  { href: "/supplements-peptides", label: "Supplements & Peptides", icon: Pill },
  { href: "/labs", label: "Labs", icon: FlaskConical },
  { href: "/body-metrics", label: "Body Metrics", icon: Scale },
  { href: "/protocols", label: "Protocols", icon: ClipboardList },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/ask", label: "Ask My Data", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/50 backdrop-blur">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">Vitalis</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Health Command Center</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-border">
        <p className="text-[10px] text-muted-foreground">v1.0.0 MVP</p>
      </div>
    </aside>
  );
}
