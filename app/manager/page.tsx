import { AppLayout } from "@/components/AppLayout";
import { ManagerTable } from "@/components/ManagerTable";
import { supabaseAdmin } from "@/lib/supabase";

export default async function ManagerDashboardPage() {
  const { data: staff } = await supabaseAdmin.from("users").select("id,name,role,certification_status");

  return (
    <AppLayout>
      <h1>Manager Dashboard</h1>
      <p className="muted">Track certification, failures, repeated mistakes, and luxury violations.</p>
      <ManagerTable rows={staff ?? []} />
      <button className="btn btn-gold" style={{ marginTop: 12 }}>Export CSV</button>
    </AppLayout>
  );
}
