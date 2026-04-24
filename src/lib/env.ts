function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(
      `[env] Missing ${name}. Set it in .env.local or your deployment environment.`,
    );
  }
  return value;
}

export const env = {
  supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: () =>
    required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  supabaseServiceRoleKey: () =>
    required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY),
  openaiApiKey: () => required("OPENAI_API_KEY", process.env.OPENAI_API_KEY),
  openaiModel: () => process.env.OPENAI_MODEL || "gpt-4o",
  openaiEvaluatorModel: () =>
    process.env.OPENAI_EVALUATOR_MODEL || process.env.OPENAI_MODEL || "gpt-4o",
};
