"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createLabPanel } from "@/lib/actions";
import { Plus, Trash2, FlaskConical } from "lucide-react";

interface LabResultInput {
  name: string;
  value: string;
  unit: string;
  refRangeLow: string;
  refRangeHigh: string;
}

interface LabPanelData {
  id: string;
  name: string;
  date: string;
  provider: string | null;
  results: Array<{
    id: string;
    name: string;
    value: number;
    unit: string;
    refRangeLow: number | null;
    refRangeHigh: number | null;
    flag: string | null;
  }>;
}

export default function LabsPage() {
  const [panels, setPanels] = useState<LabPanelData[]>([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [provider, setProvider] = useState("");
  const [results, setResults] = useState<LabResultInput[]>([
    { name: "", value: "", unit: "", refRangeLow: "", refRangeHigh: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetch("/api/labs").then(r => r.json()).then(setPanels).catch(() => {});
  }, [refreshKey]);

  function addRow() {
    setResults([...results, { name: "", value: "", unit: "", refRangeLow: "", refRangeHigh: "" }]);
  }

  function removeRow(i: number) {
    setResults(results.filter((_, idx) => idx !== i));
  }

  function updateRow(i: number, field: keyof LabResultInput, val: string) {
    const updated = [...results];
    updated[i] = { ...updated[i], [field]: val };
    setResults(updated);
  }

  async function handleSave() {
    if (!name) return;
    const validResults = results
      .filter(r => r.name && r.value)
      .map(r => {
        const val = parseFloat(r.value);
        const low = r.refRangeLow ? parseFloat(r.refRangeLow) : undefined;
        const high = r.refRangeHigh ? parseFloat(r.refRangeHigh) : undefined;
        let flag: string | undefined;
        if (low !== undefined && val < low) flag = "low";
        if (high !== undefined && val > high) flag = "high";
        return {
          name: r.name,
          value: val,
          unit: r.unit || "n/a",
          refRangeLow: low,
          refRangeHigh: high,
          flag,
        };
      });

    if (validResults.length === 0) return;
    setSaving(true);
    await createLabPanel({ name, date, provider: provider || undefined, results: validResults });
    setName(""); setProvider("");
    setResults([{ name: "", value: "", unit: "", refRangeLow: "", refRangeHigh: "" }]);
    setSaving(false);
    setRefreshKey(k => k + 1);
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Labs & Biomarkers</h1>
        <p className="text-muted-foreground text-sm">Track lab panels and biomarker trends</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Add Lab Panel</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div><Label>Panel Name *</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Comprehensive Metabolic Panel" className="mt-1" /></div>
            <div><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1" /></div>
            <div><Label>Provider</Label><Input value={provider} onChange={e => setProvider(e.target.value)} placeholder="e.g. Quest Diagnostics" className="mt-1" /></div>
          </div>

          <div className="space-y-2">
            <Label>Results</Label>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 font-medium">Biomarker</th>
                    <th className="text-left p-2 font-medium">Value</th>
                    <th className="text-left p-2 font-medium">Unit</th>
                    <th className="text-left p-2 font-medium">Ref Low</th>
                    <th className="text-left p-2 font-medium">Ref High</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="p-1"><Input value={r.name} onChange={e => updateRow(i, "name", e.target.value)} placeholder="e.g. Glucose" className="h-8" /></td>
                      <td className="p-1"><Input value={r.value} onChange={e => updateRow(i, "value", e.target.value)} type="number" className="h-8" /></td>
                      <td className="p-1"><Input value={r.unit} onChange={e => updateRow(i, "unit", e.target.value)} placeholder="mg/dL" className="h-8" /></td>
                      <td className="p-1"><Input value={r.refRangeLow} onChange={e => updateRow(i, "refRangeLow", e.target.value)} type="number" className="h-8" /></td>
                      <td className="p-1"><Input value={r.refRangeHigh} onChange={e => updateRow(i, "refRangeHigh", e.target.value)} type="number" className="h-8" /></td>
                      <td className="p-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeRow(i)}><Trash2 className="h-3 w-3" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="outline" size="sm" onClick={addRow} className="gap-1"><Plus className="h-3 w-3" /> Add Row</Button>
          </div>

          <Button onClick={handleSave} disabled={saving || !name}>{saving ? "Saving..." : "Save Lab Panel"}</Button>
        </CardContent>
      </Card>

      {/* Existing panels */}
      {panels.map(panel => (
        <Card key={panel.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              {panel.name}
              <span className="text-xs text-muted-foreground ml-auto">{new Date(panel.date).toLocaleDateString()}</span>
              {panel.provider && <Badge variant="outline" className="text-xs">{panel.provider}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {panel.results.map(r => (
                <div key={r.id} className="p-2 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">{r.name}</p>
                  <p className={`text-sm font-medium ${r.flag ? "text-red-400" : ""}`}>
                    {r.value} {r.unit}
                    {r.flag && <span className="text-xs ml-1">({r.flag})</span>}
                  </p>
                  {(r.refRangeLow !== null || r.refRangeHigh !== null) && (
                    <p className="text-[10px] text-muted-foreground">
                      Ref: {r.refRangeLow ?? "—"} – {r.refRangeHigh ?? "—"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
