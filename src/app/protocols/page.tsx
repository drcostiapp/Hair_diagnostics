"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createProtocol, updateProtocolStatus, addProtocolChange } from "@/lib/actions";
import { ClipboardList, Play, Square, Plus } from "lucide-react";

interface ProtocolData {
  id: string;
  name: string;
  category: string;
  description: string | null;
  dosage: string | null;
  frequency: string | null;
  purpose: string | null;
  status: string;
  startDate: string;
  endDate: string | null;
  subjectiveEffect: string | null;
  changes: Array<{ id: string; date: string; changeType: string; description: string }>;
}

export default function ProtocolsPage() {
  const [protocols, setProtocols] = useState<ProtocolData[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("supplement");
  const [description, setDescription] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");

  // Change log form
  const [changeProtocolId, setChangeProtocolId] = useState<string | null>(null);
  const [changeType, setChangeType] = useState("adjustment");
  const [changeDesc, setChangeDesc] = useState("");
  const [changeReason, setChangeReason] = useState("");

  useEffect(() => {
    fetch("/api/protocols").then(r => r.json()).then(setProtocols).catch(() => {});
  }, [refreshKey]);

  async function handleCreate() {
    if (!name) return;
    await createProtocol({
      name, category, description: description || undefined,
      dosage: dosage || undefined, frequency: frequency || undefined,
      purpose: purpose || undefined, startDate: new Date().toISOString().split("T")[0],
      notes: notes || undefined,
    });
    setName(""); setDescription(""); setDosage(""); setFrequency(""); setPurpose(""); setNotes("");
    setRefreshKey(k => k + 1);
  }

  async function handleStatusChange(id: string, status: string) {
    await updateProtocolStatus(id, status);
    setRefreshKey(k => k + 1);
  }

  async function handleAddChange() {
    if (!changeProtocolId || !changeDesc) return;
    await addProtocolChange({
      protocolId: changeProtocolId,
      date: new Date().toISOString().split("T")[0],
      changeType, description: changeDesc,
      reason: changeReason || undefined,
    });
    setChangeProtocolId(null); setChangeDesc(""); setChangeReason("");
    setRefreshKey(k => k + 1);
  }

  const active = protocols.filter(p => p.status === "active");
  const stopped = protocols.filter(p => p.status !== "active");

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Protocols</h1>
        <p className="text-muted-foreground text-sm">Track interventions, experiments, and protocol changes</p>
      </div>

      <Card>
        <CardHeader><CardTitle>New Protocol</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div><Label>Name *</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Creatine Loading Phase" className="mt-1" /></div>
            <div>
              <Label>Category</Label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="supplement">Supplement</option>
                <option value="peptide">Peptide</option>
                <option value="medication">Medication</option>
                <option value="diet">Diet</option>
                <option value="fasting">Fasting</option>
                <option value="training">Training</option>
                <option value="sleep">Sleep</option>
                <option value="recovery">Recovery</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div><Label>Purpose</Label><Input value={purpose} onChange={e => setPurpose(e.target.value)} className="mt-1" /></div>
            <div><Label>Dosage</Label><Input value={dosage} onChange={e => setDosage(e.target.value)} className="mt-1" /></div>
            <div><Label>Frequency</Label><Input value={frequency} onChange={e => setFrequency(e.target.value)} className="mt-1" /></div>
          </div>
          <div><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1" /></div>
          <div><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} className="mt-1" /></div>
          <Button onClick={handleCreate} disabled={!name}>Create Protocol</Button>
        </CardContent>
      </Card>

      {active.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Protocols</h2>
          {active.map(p => (
            <Card key={p.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  {p.name}
                  <Badge variant="outline" className="capitalize">{p.category}</Badge>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                  <span className="text-xs text-muted-foreground ml-auto">Since {new Date(p.startDate).toLocaleDateString()}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                <div className="flex gap-4 text-xs text-muted-foreground">
                  {p.dosage && <span>Dosage: {p.dosage}</span>}
                  {p.frequency && <span>Frequency: {p.frequency}</span>}
                  {p.purpose && <span>Purpose: {p.purpose}</span>}
                </div>
                {p.changes.length > 0 && (
                  <div className="border-t border-border pt-2 mt-2">
                    <p className="text-xs font-medium mb-1">Change Log</p>
                    {p.changes.map(c => (
                      <div key={c.id} className="text-xs text-muted-foreground">
                        <span className="font-medium capitalize">{c.changeType}</span>: {c.description}
                        <span className="ml-2">{new Date(c.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleStatusChange(p.id, "stopped")} className="gap-1">
                    <Square className="h-3 w-3" /> Stop
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setChangeProtocolId(p.id)} className="gap-1">
                    <Plus className="h-3 w-3" /> Log Change
                  </Button>
                </div>
                {changeProtocolId === p.id && (
                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="grid md:grid-cols-2 gap-2">
                      <select value={changeType} onChange={e => setChangeType(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                        <option value="adjustment">Dosage Adjustment</option>
                        <option value="frequency_change">Frequency Change</option>
                        <option value="observation">Observation</option>
                        <option value="side_effect">Side Effect</option>
                        <option value="positive_outcome">Positive Outcome</option>
                      </select>
                      <Input value={changeDesc} onChange={e => setChangeDesc(e.target.value)} placeholder="Description" className="h-9" />
                    </div>
                    <Input value={changeReason} onChange={e => setChangeReason(e.target.value)} placeholder="Reason (optional)" className="h-9" />
                    <Button size="sm" onClick={handleAddChange} disabled={!changeDesc}>Save Change</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {stopped.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">Stopped Protocols</h2>
          {stopped.map(p => (
            <Card key={p.id} className="opacity-60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {p.name}
                  <Badge variant="secondary">Stopped</Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(p.startDate).toLocaleDateString()} – {p.endDate ? new Date(p.endDate).toLocaleDateString() : "?"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {p.purpose && <p className="text-sm text-muted-foreground">{p.purpose}</p>}
                <Button variant="outline" size="sm" className="mt-2 gap-1" onClick={() => handleStatusChange(p.id, "active")}>
                  <Play className="h-3 w-3" /> Restart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
