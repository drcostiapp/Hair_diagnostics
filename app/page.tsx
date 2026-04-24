import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold">
        Dr. Costi House of Beauty
      </p>
      <h1 className="font-display text-5xl leading-tight text-anchor sm:text-6xl">
        The Experience Simulator
      </h1>
      <div className="gold-divider my-8 w-48" />
      <p className="max-w-xl text-sm leading-relaxed text-anchor/70 sm:text-base">
        A private training environment for our team. Every interaction is
        rehearsed here, so that every real client is received flawlessly.
      </p>
      <div className="mt-10 flex gap-4">
        <Link
          href="/login"
          className="rounded-full bg-anchor px-8 py-3 text-sm font-medium tracking-wide text-ivory transition hover:bg-anchor-soft"
        >
          Staff Sign In
        </Link>
        <Link
          href="/login?mode=signup"
          className="rounded-full border border-anchor/30 px-8 py-3 text-sm font-medium tracking-wide text-anchor transition hover:border-gold hover:text-gold-dark"
        >
          Request Access
        </Link>
      </div>
    </main>
  );
}
