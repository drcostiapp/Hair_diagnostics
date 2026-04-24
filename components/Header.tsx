import Link from "next/link";
import { ROLE_LABELS, type UserProfile } from "@/lib/types";

export default function Header({ profile }: { profile: UserProfile }) {
  return (
    <header className="border-b border-anchor/10 bg-ivory-soft">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/train" className="flex items-baseline gap-3">
          <span className="text-[10px] uppercase tracking-[0.35em] text-gold">
            Dr. Costi
          </span>
          <span className="font-display text-xl text-anchor">
            Experience Simulator
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/train"
            className="text-anchor/70 hover:text-anchor"
          >
            Training
          </Link>
          {profile.is_manager && (
            <Link
              href="/dashboard"
              className="text-anchor/70 hover:text-anchor"
            >
              Dashboard
            </Link>
          )}
          <div className="hidden text-right sm:block">
            <div className="text-sm text-anchor">{profile.full_name}</div>
            <div className="text-[10px] uppercase tracking-widest text-anchor/50">
              {ROLE_LABELS[profile.role]}
            </div>
          </div>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-full border border-anchor/20 px-4 py-1.5 text-xs uppercase tracking-widest text-anchor/70 hover:border-gold hover:text-gold-dark"
            >
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
