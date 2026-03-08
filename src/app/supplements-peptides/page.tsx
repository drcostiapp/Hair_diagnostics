"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createSupplement, createPeptide, toggleSupplement, togglePeptide } from "@/lib/actions";
import { Pill, Syringe, Power } from "lucide-react";

interface ItemData {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  purpose: string | null;
  active: boolean;
  startDate: string | null;
  route?: string | null;
}

export default function SupplementsPeptidesPage() {
  const [supplements, setSupplements] = useState<ItemData[]>([]);
  const [peptides, setPeptides] = useState<ItemData[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Supplement form
  const [sName, setSName] = useState("");
  const [sBrand, setSBrand] = useState("");
  const [sDosage, setSDosage] = useState("");
  const [sFrequency, setSFrequency] = useState("daily");
  const [sPurpose, setSPurpose] = useState("");
  const [sNotes, setSNotes] = useState("");

  // Peptide form
  const [pName, setPName] = useState("");
  const [pDosage, setPDosage] = useState("");
  const [pFrequency, setPFrequency] = useState("daily");
  const [pRoute, setPRoute] = useState("subcutaneous");
  const [pPurpose, setPPurpose] = useState("");
  const [pNotes, setPNotes] = useState("");

  useEffect(() => {
    fetch("/api/supplements").then(r => r.json()).then(setSupplements).catch(() => {});
    fetch("/api/peptides").then(r => r.json()).then(setPeptides).catch(() => {});
  }, [refreshKey]);

  async function handleAddSupplement() {
    if (!sName) return;
    await createSupplement({
      name: sName, brand: sBrand || undefined, dosage: sDosage || undefined,
      frequency: sFrequency || undefined, purpose: sPurpose || undefined,
      startDate: new Date().toISOString().split("T")[0], notes: sNotes || undefined,
    });
    setSName(""); setSBrand(""); setSDosage(""); setSPurpose(""); setSNotes("");
    setRefreshKey(k => k + 1);
  }

  async function handleAddPeptide() {
    if (!pName) return;
    await createPeptide({
      name: pName, dosage: pDosage || undefined, frequency: pFrequency || undefined,
      route: pRoute || undefined, purpose: pPurpose || undefined,
      startDate: new Date().toISOString().split("T")[0], notes: pNotes || undefined,
    });
    setPName(""); setPDosage(""); setPPurpose(""); setPNotes("");
    setRefreshKey(k => k + 1);
  }

  async function handleToggleSupplement(id: string, active: boolean) {
    await toggleSupplement(id, !active);
    setRefreshKey(k => k + 1);
  }

  async function handleTogglePeptide(id: string, active: boolean) {
    await togglePeptide(id, !active);
    setRefreshKey(k => k + 1);
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Supplements & Peptides</h1>
        <p className="text-muted-foreground text-sm">Manage your supplement and peptide stacks</p>
      </div>

      <Tabs defaultValue="supplements">
        <TabsList>
          <TabsTrigger value="supplements" className="gap-2"><Pill className="h-4 w-4" /> Supplements</TabsTrigger>
          <TabsTrigger value="peptides" className="gap-2"><Syringe className="h-4 w-4" /> Peptides</TabsTrigger>
        </TabsList>

        <TabsContent value="supplements" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Add Supplement</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div><Label>Name *</Label><Input value={sName} onChange={e => setSName(e.target.value)} placeholder="e.g. Magnesium Glycinate" className="mt-1" /></div>
                <div><Label>Brand</Label><Input value={sBrand} onChange={e => setSBrand(e.target.value)} className="mt-1" /></div>
                <div><Label>Dosage</Label><Input value={sDosage} onChange={e => setSDosage(e.target.value)} placeholder="e.g. 400mg" className="mt-1" /></div>
                <div><Label>Frequency</Label><Input value={sFrequency} onChange={e => setSFrequency(e.target.value)} className="mt-1" /></div>
                <div><Label>Purpose</Label><Input value={sPurpose} onChange={e => setSPurpose(e.target.value)} placeholder="e.g. sleep, recovery" className="mt-1" /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={sNotes} onChange={e => setSNotes(e.target.value)} className="mt-1" /></div>
              <Button onClick={handleAddSupplement} disabled={!sName}>Add Supplement</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Your Supplements</CardTitle></CardHeader>
            <CardContent>
              {supplements.length === 0 && <p className="text-sm text-muted-foreground">No supplements added yet</p>}
              <div className="space-y-3">
                {supplements.map(s => (
                  <div key={s.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{s.name}</span>
                        <Badge variant={s.active ? "default" : "secondary"}>{s.active ? "Active" : "Stopped"}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s.dosage} · {s.frequency} {s.purpose ? `· ${s.purpose}` : ""}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleToggleSupplement(s.id, s.active)}>
                      <Power className={`h-4 w-4 ${s.active ? "text-green-400" : "text-muted-foreground"}`} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peptides" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Add Peptide</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div><Label>Name *</Label><Input value={pName} onChange={e => setPName(e.target.value)} placeholder="e.g. BPC-157" className="mt-1" /></div>
                <div><Label>Dosage</Label><Input value={pDosage} onChange={e => setPDosage(e.target.value)} placeholder="e.g. 250mcg" className="mt-1" /></div>
                <div><Label>Frequency</Label><Input value={pFrequency} onChange={e => setPFrequency(e.target.value)} className="mt-1" /></div>
                <div>
                  <Label>Route</Label>
                  <select value={pRoute} onChange={e => setPRoute(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="subcutaneous">Subcutaneous</option>
                    <option value="intramuscular">Intramuscular</option>
                    <option value="oral">Oral</option>
                    <option value="nasal">Nasal</option>
                    <option value="topical">Topical</option>
                  </select>
                </div>
                <div><Label>Purpose</Label><Input value={pPurpose} onChange={e => setPPurpose(e.target.value)} className="mt-1" /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={pNotes} onChange={e => setPNotes(e.target.value)} className="mt-1" /></div>
              <Button onClick={handleAddPeptide} disabled={!pName}>Add Peptide</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Your Peptides</CardTitle></CardHeader>
            <CardContent>
              {peptides.length === 0 && <p className="text-sm text-muted-foreground">No peptides added yet</p>}
              <div className="space-y-3">
                {peptides.map(p => (
                  <div key={p.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{p.name}</span>
                        <Badge variant={p.active ? "default" : "secondary"}>{p.active ? "Active" : "Stopped"}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.dosage} · {p.route} · {p.frequency} {p.purpose ? `· ${p.purpose}` : ""}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleTogglePeptide(p.id, p.active)}>
                      <Power className={`h-4 w-4 ${p.active ? "text-green-400" : "text-muted-foreground"}`} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
