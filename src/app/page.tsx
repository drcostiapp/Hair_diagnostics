import { getDashboardData } from "@/lib/dashboard-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricChart } from "@/components/charts/metric-chart";
import { confidenceBadge, formatDateShort, severityColor } from "@/lib/utils";
import {
  Activity,
  Moon,
  Zap,
  Smile,
  Pill,
  Dumbbell,
  AlertTriangle,
  TrendingUp,
  Scale,
  FlaskConical,
  Syringe,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back{data.user?.name ? `, ${data.user.name}` : ""}
          </h1>
          <p className="text-muted-foreground text-sm">Your health command center</p>
        </div>
        <Link
          href="/daily-log"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
        >
          <Activity className="h-4 w-4" />
          Log Today
        </Link>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard
          icon={<Scale className="h-4 w-4" />}
          label="Weight"
          value={data.metrics.currentWeight ? `${data.metrics.currentWeight} lbs` : "—"}
        />
        <MetricCard
          icon={<Moon className="h-4 w-4" />}
          label="Sleep Quality"
          value={data.metrics.avgSleepQuality ? `${data.metrics.avgSleepQuality}/10` : "—"}
          sub="7-day avg"
        />
        <MetricCard
          icon={<Zap className="h-4 w-4" />}
          label="Energy"
          value={data.metrics.avgEnergy ? `${data.metrics.avgEnergy}/10` : "—"}
          sub="7-day avg"
        />
        <MetricCard
          icon={<Smile className="h-4 w-4" />}
          label="Mood"
          value={data.metrics.avgMood ? `${data.metrics.avgMood}/10` : "—"}
          sub="7-day avg"
        />
        <MetricCard
          icon={<Dumbbell className="h-4 w-4" />}
          label="Workouts"
          value={`${data.metrics.exerciseSessionsThisWeek}`}
          sub="this week"
        />
        <MetricCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Symptoms"
          value={`${data.metrics.symptomCountThisWeek}`}
          sub="this week"
        />
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Scale className="h-4 w-4" /> Weight Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MetricChart data={data.charts.weight} dataKey="value" label="Weight" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Moon className="h-4 w-4" /> Sleep Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MetricChart data={data.charts.sleep} dataKey="quality" color="#8b5cf6" label="Quality" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" /> Energy Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MetricChart data={data.charts.energy} dataKey="value" color="#f59e0b" label="Energy" />
          </CardContent>
        </Card>
      </div>

      {/* Active Protocols + Supplements + Peptides */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Pill className="h-4 w-4 text-green-400" /> Active Supplements
              <Badge variant="secondary" className="ml-auto">{data.activeSupplements.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.activeSupplements.length === 0 && (
              <p className="text-sm text-muted-foreground">No active supplements</p>
            )}
            {data.activeSupplements.slice(0, 8).map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span>{s.name}</span>
                <span className="text-muted-foreground text-xs">{s.dosage}</span>
              </div>
            ))}
            {data.activeSupplements.length > 8 && (
              <p className="text-xs text-muted-foreground">+{data.activeSupplements.length - 8} more</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Syringe className="h-4 w-4 text-purple-400" /> Active Peptides
              <Badge variant="secondary" className="ml-auto">{data.activePeptides.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.activePeptides.length === 0 && (
              <p className="text-sm text-muted-foreground">No active peptides</p>
            )}
            {data.activePeptides.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span>{p.name}</span>
                <span className="text-muted-foreground text-xs">{p.dosage} &middot; {p.route}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" /> Active Protocols
              <Badge variant="secondary" className="ml-auto">{data.activeProtocols.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.activeProtocols.length === 0 && (
              <p className="text-sm text-muted-foreground">No active protocols</p>
            )}
            {data.activeProtocols.map((p) => (
              <div key={p.id} className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{p.name}</span>
                  <Badge variant="outline" className="text-xs">{p.category}</Badge>
                </div>
                {p.purpose && <p className="text-xs text-muted-foreground mt-0.5">{p.purpose}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity + Symptoms + Recommendations */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Meals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentMeals.length === 0 && (
              <p className="text-sm text-muted-foreground">No meals logged recently</p>
            )}
            {data.recentMeals.map((m) => (
              <div key={m.id} className="text-sm border-b border-border pb-2 last:border-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{m.mealType}</span>
                  <span className="text-xs text-muted-foreground">{formatDateShort(m.date)}</span>
                </div>
                {m.description && <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>}
                {m.calories && (
                  <p className="text-xs text-muted-foreground">
                    {m.calories} cal · P:{m.protein ?? "?"}g C:{m.carbs ?? "?"}g F:{m.fat ?? "?"}g
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Symptoms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentSymptoms.length === 0 && (
              <p className="text-sm text-muted-foreground">No symptoms reported this week</p>
            )}
            {data.recentSymptoms.slice(0, 6).map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span>{s.symptom}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${severityColor(s.severity)}`}>
                    {s.severity}/10
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDateShort(s.date)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recommendations.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Add more data to generate recommendations
              </p>
            )}
            {data.recommendations.map((r) => (
              <div key={r.id} className="text-sm border-b border-border pb-2 last:border-0">
                <div className="flex items-center gap-2">
                  <Badge className={`text-[10px] ${confidenceBadge(r.confidence)}`}>
                    {r.confidence}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">{r.priority}</Badge>
                </div>
                <p className="font-medium mt-1">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Latest Labs */}
      {data.recentLabs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FlaskConical className="h-4 w-4" /> Latest Lab Panel: {data.recentLabs[0].name}
              <span className="text-xs text-muted-foreground ml-auto">{formatDateShort(data.recentLabs[0].date)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {data.recentLabs[0].results.slice(0, 12).map((r) => (
                <div key={r.id} className="text-sm">
                  <p className="text-xs text-muted-foreground">{r.name}</p>
                  <p className={`font-medium ${r.flag === "high" || r.flag === "low" ? "text-red-400" : ""}`}>
                    {r.value} {r.unit}
                    {r.flag && <span className="text-xs ml-1">({r.flag})</span>}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className="text-xl font-bold">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
