import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-anchor text-ivory p-12">
        <div>
          <div className="text-[11px] tracking-luxe text-champagne uppercase">
            Dr. Costi House of Beauty
          </div>
          <div className="font-display text-4xl mt-2 leading-tight">
            The Experience
            <br />
            Simulator
          </div>
        </div>
        <div className="max-w-md">
          <p className="font-display text-2xl leading-snug text-ivory/90">
            &ldquo;She never waits, never asks. Everything is already done.&rdquo;
          </p>
          <div className="divider my-6 opacity-50" />
          <p className="text-sm text-ivory/60 leading-relaxed">
            A private conditioning engine for the She Doesn&apos;t Wait Private Consultation
            experience. Designed for staff only.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 md:p-16 bg-ivory">
        <div className="w-full max-w-sm">
          <div className="text-[11px] tracking-luxe uppercase text-bronze">Staff Sign-in</div>
          <h1 className="font-display text-3xl text-anchor mt-2">Welcome back.</h1>
          <p className="text-sm text-bronze mt-2">Enter your credentials to continue.</p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
