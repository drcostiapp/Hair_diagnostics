import { AppLayout } from "@/components/AppLayout";
import { StaffProfileCard } from "@/components/StaffProfileCard";
import { ProgressChart } from "@/components/ProgressChart";
import { supabaseAdmin } from "@/lib/supabase";

export default async function StaffProfilePage({ params }: { params: { id: string } }) {
  const { data: user } = await supabaseAdmin.from("users").select("*").eq("id", params.id).maybeSingle();
  const { data: simulations } = await supabaseAdmin
    .from("simulations")
    .select("final_score, ended_at")
    .eq("user_id", params.id)
    .not("ended_at", "is", null)
    .order("ended_at", { ascending: true });

  if (!user) return <AppLayout><p>User not found.</p></AppLayout>;

  return (
    <AppLayout>
      <h1>Staff Profile</h1>
      <StaffProfileCard user={user} />
      <h3>Score Trend</h3>
      <ProgressChart data={(simulations ?? []).map((s) => ({ date: new Date(s.ended_at).toLocaleDateString(), score: s.final_score }))} />
    </AppLayout>
  );
}
