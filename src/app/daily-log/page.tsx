"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertDailyLog, createSymptom, createSleepEntry, createExercise } from "@/lib/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function SliderInput({ label, value, onChange, max = 10 }: { label: string; value: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Label className="text-sm">{label}</Label>
        <span className="text-sm font-bold text-primary">{value}/{max}</span>
      </div>
      <input
        type="range"
        min={1}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
      />
    </div>
  );
}

export default function DailyLogPage() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [mood, setMood] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [stress, setStress] = useState(3);
  const [hydration, setHydration] = useState(2.5);
  const [steps, setSteps] = useState(8000);
  const [recovery, setRecovery] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Symptom state
  const [symptom, setSymptom] = useState("");
  const [symptomSeverity, setSymptomSeverity] = useState(5);
  const [symptomTriggers, setSymptomTriggers] = useState("");

  // Sleep state
  const [bedtime, setBedtime] = useState("22:30");
  const [wakeTime, setWakeTime] = useState("06:30");
  const [sleepQuality, setSleepQuality] = useState(7);
  const [sleepDuration, setSleepDuration] = useState(8);

  // Exercise state
  const [exerciseType, setExerciseType] = useState("strength");
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseDuration, setExerciseDuration] = useState(60);
  const [exerciseIntensity, setExerciseIntensity] = useState(7);

  async function handleSaveLog() {
    setSaving(true);
    await upsertDailyLog({ date, mood, energy, stress, hydration, steps, recovery, notes });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleLogSymptom() {
    if (!symptom) return;
    await createSymptom({ date, symptom, severity: symptomSeverity, triggers: symptomTriggers });
    setSymptom("");
    setSymptomTriggers("");
  }

  async function handleLogSleep() {
    await createSleepEntry({ date, bedtime, wakeTime, duration: sleepDuration, quality: sleepQuality });
  }

  async function handleLogExercise() {
    if (!exerciseName) return;
    await createExercise({ date, type: exerciseType, name: exerciseName, duration: exerciseDuration, intensity: exerciseIntensity });
    setExerciseName("");
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Daily Log</h1>
        <p className="text-muted-foreground text-sm">Track your daily metrics, symptoms, sleep, and exercise</p>
      </div>

      <div className="flex items-center gap-3">
        <Label>Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily">Daily Metrics</TabsTrigger>
          <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
          <TabsTrigger value="sleep">Sleep</TabsTrigger>
          <TabsTrigger value="exercise">Exercise</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>How are you today?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <SliderInput label="Mood" value={mood} onChange={setMood} />
                <SliderInput label="Energy" value={energy} onChange={setEnergy} />
                <SliderInput label="Stress" value={stress} onChange={setStress} />
                <div>
                  <Label className="text-sm">Hydration (liters)</Label>
                  <Input type="number" step={0.5} min={0} max={10} value={hydration} onChange={(e) => setHydration(Number(e.target.value))} className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Steps</Label>
                  <Input type="number" step={500} min={0} value={steps} onChange={(e) => setSteps(Number(e.target.value))} className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Recovery Notes</Label>
                  <Input value={recovery} onChange={(e) => setRecovery(e.target.value)} placeholder="e.g. feeling well recovered" className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-sm">Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything notable about today..." className="mt-1" />
              </div>
              <Button onClick={handleSaveLog} disabled={saving}>
                {saving ? "Saving..." : saved ? "Saved!" : "Save Daily Log"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symptoms">
          <Card>
            <CardHeader>
              <CardTitle>Log a Symptom</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Symptom</Label>
                <Input value={symptom} onChange={(e) => setSymptom(e.target.value)} placeholder="e.g. headache, bloating, fatigue" className="mt-1" />
              </div>
              <SliderInput label="Severity" value={symptomSeverity} onChange={setSymptomSeverity} />
              <div>
                <Label>Possible Triggers</Label>
                <Input value={symptomTriggers} onChange={(e) => setSymptomTriggers(e.target.value)} placeholder="e.g. dairy, poor sleep" className="mt-1" />
              </div>
              <Button onClick={handleLogSymptom} disabled={!symptom}>Log Symptom</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sleep">
          <Card>
            <CardHeader>
              <CardTitle>Log Sleep</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Bedtime</Label>
                  <Input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Wake Time</Label>
                  <Input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Duration (hours)</Label>
                  <Input type="number" step={0.5} min={0} max={24} value={sleepDuration} onChange={(e) => setSleepDuration(Number(e.target.value))} className="mt-1" />
                </div>
              </div>
              <SliderInput label="Sleep Quality" value={sleepQuality} onChange={setSleepQuality} />
              <Button onClick={handleLogSleep}>Log Sleep</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercise">
          <Card>
            <CardHeader>
              <CardTitle>Log Exercise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <select
                    value={exerciseType}
                    onChange={(e) => setExerciseType(e.target.value)}
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="strength">Strength</option>
                    <option value="cardio">Cardio</option>
                    <option value="hiit">HIIT</option>
                    <option value="yoga">Yoga</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="sports">Sports</option>
                    <option value="walking">Walking</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label>Name / Description</Label>
                  <Input value={exerciseName} onChange={(e) => setExerciseName(e.target.value)} placeholder="e.g. Upper body push" className="mt-1" />
                </div>
                <div>
                  <Label>Duration (min)</Label>
                  <Input type="number" min={0} value={exerciseDuration} onChange={(e) => setExerciseDuration(Number(e.target.value))} className="mt-1" />
                </div>
              </div>
              <SliderInput label="Intensity" value={exerciseIntensity} onChange={setExerciseIntensity} />
              <Button onClick={handleLogExercise} disabled={!exerciseName}>Log Exercise</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
