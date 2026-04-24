import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-gold">
          Dr. Costi House of Beauty
        </p>
        <h1 className="mt-2 font-display text-4xl text-anchor">
          Experience Simulator
        </h1>
        <div className="gold-divider mx-auto mt-4 w-32" />
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
