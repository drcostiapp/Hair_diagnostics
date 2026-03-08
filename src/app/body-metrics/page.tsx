"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createWeightEntry, createBodyComposition } from "@/lib/actions";
import { MetricChart } from "@/components/charts/metric-chart";

interface WeightData { id: string; date: string; weight: number; unit: string }
interface BodyCompData { id: string; date: string; weight: number | null; bodyFat: number | null; muscleMass: number | null; waist: number | null; visceralFat: number | null }

export default function BodyMetricsPage() {
  const today = new Date().toISOString().split("T")[0];
  const [weightHistory, setWeightHistory] = useState<WeightData[]>([]);
  const [bodyCompHistory, setBodyCompHistory] = useState<BodyCompData[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Weight form
  const [wDate, setWDate] = useState(today);
  const [weight, setWeight] = useState<number | "">("");

  // Body comp form
  const [bcDate, setBcDate] = useState(today);
  const [bcWeight, setBcWeight] = useState<number | "">("");
  const [bodyFat, setBodyFat] = useState<number | "">("");
  const [muscleMass, setMuscleMass] = useState<number | "">("");
  const [waist, setWaist] = useState<number | "">("");
  const [visceralFat, setVisceralFat] = useState<number | "">("");
  const [scanType, setScanType] = useState("");

  useEffect(() => {
    fetch("/api/weight").then(r => r.json()).then(setWeightHistory).catch(() => {});
    fetch("/api/body-metrics").then(r => r.json()).then(setBodyCompHistory).catch(() => {});
  }, [refreshKey]);

  async function handleLogWeight() {
    if (!weight) return;
    await createWeightEntry({ date: wDate, weight: Number(weight) });
    setWeight("");
    setRefreshKey(k => k + 1);
  }

  async function handleLogBodyComp() {
    await createBodyComposition({
      date: bcDate,
      weight: bcWeight || undefined,
      bodyFat: bodyFat || undefined,
      muscleMass: muscleMass || undefined,
      waist: waist || undefined,
      visceralFat: visceralFat || undefined,
      scanType: scanType || undefined,
    });
    setBcWeight(""); setBodyFat(""); setMuscleMass(""); setWaist(""); setVisceralFat("");
    setRefreshKey(k => k + 1);
  }

  const weightChartData = weightHistory.map(w => ({ date: w.date.split("T")[0], value: w.weight }));
  const bodyFatChartData = bodyCompHistory.filter(b => b.bodyFat).map(b => ({ date: b.date.split("T")[0], value: b.bodyFat }));

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Body Metrics</h1>
        <p className="text-muted-foreground text-sm">Track weight, body composition, and measurements</p>
      </div>

      <Tabs defaultValue="weight">
        <TabsList>
          <TabsTrigger value="weight">Weight</TabsTrigger>
          <TabsTrigger value="composition">Body Composition</TabsTrigger>
        </TabsList>

        <TabsContent value="weight" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Log Weight</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div><Label>Date</Label><Input type="date" value={wDate} onChange={e => setWDate(e.target.value)} className="mt-1" /></div>
                <div><Label>Weight (lbs)</Label><Input type="number" step={0.1} value={weight} onChange={e => setWeight(e.target.value ? Number(e.target.value) : "")} className="mt-1" /></div>
              </div>
              <Button onClick={handleLogWeight} disabled={!weight}>Log Weight</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Weight Trend</CardTitle></CardHeader>
            <CardContent>
              <MetricChart data={weightChartData} dataKey="value" label="Weight (lbs)" height={300} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="composition" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Log Body Composition</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div><Label>Date</Label><Input type="date" value={bcDate} onChange={e => setBcDate(e.target.value)} className="mt-1" /></div>
                <div><Label>Weight (lbs)</Label><Input type="number" step={0.1} value={bcWeight} onChange={e => setBcWeight(e.target.value ? Number(e.target.value) : "")} className="mt-1" /></div>
                <div><Label>Body Fat %</Label><Input type="number" step={0.1} value={bodyFat} onChange={e => setBodyFat(e.target.value ? Number(e.target.value) : "")} className="mt-1" /></div>
                <div><Label>Muscle Mass (lbs)</Label><Input type="number" step={0.1} value={muscleMass} onChange={e => setMuscleMass(e.target.value ? Number(e.target.value) : "")} className="mt-1" /></div>
                <div><Label>Waist (in)</Label><Input type="number" step={0.1} value={waist} onChange={e => setWaist(e.target.value ? Number(e.target.value) : "")} className="mt-1" /></div>
                <div><Label>Visceral Fat</Label><Input type="number" step={0.1} value={visceralFat} onChange={e => setVisceralFat(e.target.value ? Number(e.target.value) : "")} className="mt-1" /></div>
                <div><Label>Scan Type</Label><Input value={scanType} onChange={e => setScanType(e.target.value)} placeholder="e.g. DEXA, InBody" className="mt-1" /></div>
              </div>
              <Button onClick={handleLogBodyComp}>Log Body Composition</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Body Fat Trend</CardTitle></CardHeader>
            <CardContent>
              <MetricChart data={bodyFatChartData} dataKey="value" color="#f59e0b" label="Body Fat %" height={300} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
