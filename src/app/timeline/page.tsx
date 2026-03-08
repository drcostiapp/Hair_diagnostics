import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  Pill, Syringe, FlaskConical, AlertTriangle, ClipboardList, Scale, Dumbbell, Moon,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface TimelineEvent {
  id: string;
  date: Date;
  type: string;
  icon: string;
  title: string;
  detail?: string;
  badge?: string;
}

export default async function TimelinePage() {
  const userId = getUserId();

  const [supplements, peptides, protocols, protocolChanges, labs, symptoms, weight, bodyComp] = await Promise.all([
    prisma.supplement.findMany({ where: { userId }, orderBy: { startDate: "desc" } }),
    prisma.peptide.findMany({ where: { userId }, orderBy: { startDate: "desc" } }),
    prisma.protocol.findMany({ where: { userId }, orderBy: { startDate: "desc" } }),
    prisma.protocolChange.findMany({ include: { protocol: true }, orderBy: { date: "desc" } }),
    prisma.labPanel.findMany({ where: { userId }, orderBy: { date: "desc" }, include: { results: true } }),
    prisma.symptomEntry.findMany({ where: { userId, severity: { gte: 7 } }, orderBy: { date: "desc" }, take: 20 }),
    prisma.weightEntry.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 10 }),
    prisma.bodyCompositionEntry.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 10 }),
  ]);

  const events: TimelineEvent[] = [];

  supplements.forEach(s => {
    if (s.startDate) events.push({ id: `s-start-${s.id}`, date: s.startDate, type: "supplement", icon: "pill", title: `Started ${s.name}`, detail: s.dosage ?? undefined, badge: "supplement" });
    if (s.endDate) events.push({ id: `s-end-${s.id}`, date: s.endDate, type: "supplement", icon: "pill", title: `Stopped ${s.name}`, badge: "stopped" });
  });

  peptides.forEach(p => {
    if (p.startDate) events.push({ id: `p-start-${p.id}`, date: p.startDate, type: "peptide", icon: "syringe", title: `Started ${p.name}`, detail: `${p.dosage ?? ""} ${p.route ?? ""}`.trim(), badge: "peptide" });
    if (p.endDate) events.push({ id: `p-end-${p.id}`, date: p.endDate, type: "peptide", icon: "syringe", title: `Stopped ${p.name}`, badge: "stopped" });
  });

  protocols.forEach(p => {
    events.push({ id: `pr-start-${p.id}`, date: p.startDate, type: "protocol", icon: "clipboard", title: `Protocol: ${p.name}`, detail: p.purpose ?? undefined, badge: p.status });
    if (p.endDate) events.push({ id: `pr-end-${p.id}`, date: p.endDate, type: "protocol", icon: "clipboard", title: `Ended: ${p.name}`, badge: "stopped" });
  });

  protocolChanges.forEach(c => {
    events.push({ id: `pc-${c.id}`, date: c.date, type: "protocol-change", icon: "clipboard", title: `${c.protocol.name}: ${c.changeType}`, detail: c.description });
  });

  labs.forEach(l => {
    const flagged = l.results.filter(r => r.flag);
    events.push({ id: `lab-${l.id}`, date: l.date, type: "lab", icon: "flask", title: `Lab: ${l.name}`, detail: flagged.length > 0 ? `${flagged.length} flagged results` : `${l.results.length} markers`, badge: flagged.length > 0 ? "flagged" : "normal" });
  });

  symptoms.forEach(s => {
    events.push({ id: `sym-${s.id}`, date: s.date, type: "symptom", icon: "alert", title: s.symptom, detail: `Severity: ${s.severity}/10`, badge: "symptom" });
  });

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const iconMap: Record<string, React.ReactNode> = {
    pill: <Pill className="h-4 w-4 text-green-400" />,
    syringe: <Syringe className="h-4 w-4 text-purple-400" />,
    clipboard: <ClipboardList className="h-4 w-4 text-blue-400" />,
    flask: <FlaskConical className="h-4 w-4 text-cyan-400" />,
    alert: <AlertTriangle className="h-4 w-4 text-red-400" />,
    scale: <Scale className="h-4 w-4 text-yellow-400" />,
    dumbbell: <Dumbbell className="h-4 w-4 text-orange-400" />,
    moon: <Moon className="h-4 w-4 text-indigo-400" />,
  };

  const badgeColors: Record<string, string> = {
    supplement: "bg-green-500/20 text-green-400",
    peptide: "bg-purple-500/20 text-purple-400",
    active: "bg-blue-500/20 text-blue-400",
    stopped: "bg-zinc-500/20 text-zinc-400",
    flagged: "bg-red-500/20 text-red-400",
    normal: "bg-cyan-500/20 text-cyan-400",
    symptom: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Timeline</h1>
        <p className="text-muted-foreground text-sm">Chronological view of health events and changes</p>
      </div>

      {events.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No events yet. Start logging data to populate your timeline.
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-4">
          {events.map(event => (
            <div key={event.id} className="relative pl-10">
              <div className="absolute left-2.5 top-3 w-3 h-3 rounded-full bg-card border-2 border-primary" />
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{iconMap[event.icon]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{event.title}</span>
                        {event.badge && (
                          <Badge className={`text-[10px] ${badgeColors[event.badge] ?? ""}`}>
                            {event.badge}
                          </Badge>
                        )}
                      </div>
                      {event.detail && <p className="text-xs text-muted-foreground mt-0.5">{event.detail}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">{formatDate(event.date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
