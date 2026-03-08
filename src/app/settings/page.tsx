"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile, createGoal } from "@/lib/actions";
import { Settings, Target } from "lucide-react";

interface ProfileData {
  name: string;
  age: number | null;
  sex: string | null;
  height: number | null;
  heightUnit: string;
  activityLevel: string | null;
  dietaryStyle: string | null;
  sleepHabits: string | null;
  medicalHistory: string | null;
  familyHistory: string | null;
  allergies: string | null;
  diagnoses: string | null;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "", age: null, sex: null, height: null, heightUnit: "in",
    activityLevel: null, dietaryStyle: null, sleepHabits: null,
    medicalHistory: null, familyHistory: null, allergies: null, diagnoses: null,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Goal form
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalCategory, setGoalCategory] = useState("health");

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then((data) => {
        if (data) setProfile(data);
      })
      .catch(() => {});
  }, []);

  async function handleSaveProfile() {
    setSaving(true);
    await updateProfile({
      name: profile.name || undefined,
      age: profile.age ?? undefined,
      sex: profile.sex ?? undefined,
      height: profile.height ?? undefined,
      heightUnit: profile.heightUnit,
      activityLevel: profile.activityLevel ?? undefined,
      dietaryStyle: profile.dietaryStyle ?? undefined,
      sleepHabits: profile.sleepHabits ?? undefined,
      medicalHistory: profile.medicalHistory ?? undefined,
      familyHistory: profile.familyHistory ?? undefined,
      allergies: profile.allergies ?? undefined,
      diagnoses: profile.diagnoses ?? undefined,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleAddGoal() {
    if (!goalTitle) return;
    await createGoal({ title: goalTitle, description: goalDescription || undefined, category: goalCategory });
    setGoalTitle(""); setGoalDescription("");
  }

  function updateField(field: keyof ProfileData, value: string | number | null) {
    setProfile(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6" /> Settings & Profile
        </h1>
        <p className="text-muted-foreground text-sm">Configure your profile and health baseline</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Personal Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div><Label>Name</Label><Input value={profile.name} onChange={e => updateField("name", e.target.value)} className="mt-1" /></div>
            <div><Label>Age</Label><Input type="number" value={profile.age ?? ""} onChange={e => updateField("age", e.target.value ? Number(e.target.value) : null)} className="mt-1" /></div>
            <div>
              <Label>Sex</Label>
              <select value={profile.sex ?? ""} onChange={e => updateField("sex", e.target.value || null)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div><Label>Height</Label><Input type="number" step={0.1} value={profile.height ?? ""} onChange={e => updateField("height", e.target.value ? Number(e.target.value) : null)} className="mt-1" /></div>
            <div>
              <Label>Height Unit</Label>
              <select value={profile.heightUnit} onChange={e => updateField("heightUnit", e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="in">Inches</option>
                <option value="cm">Centimeters</option>
              </select>
            </div>
            <div>
              <Label>Activity Level</Label>
              <select value={profile.activityLevel ?? ""} onChange={e => updateField("activityLevel", e.target.value || null)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select</option>
                <option value="sedentary">Sedentary</option>
                <option value="lightly_active">Lightly Active</option>
                <option value="moderately_active">Moderately Active</option>
                <option value="very_active">Very Active</option>
                <option value="extremely_active">Extremely Active</option>
              </select>
            </div>
            <div><Label>Dietary Style</Label><Input value={profile.dietaryStyle ?? ""} onChange={e => updateField("dietaryStyle", e.target.value || null)} placeholder="e.g. High protein, Mediterranean" className="mt-1" /></div>
            <div><Label>Sleep Habits</Label><Input value={profile.sleepHabits ?? ""} onChange={e => updateField("sleepHabits", e.target.value || null)} placeholder="e.g. 7-8hrs, variable" className="mt-1" /></div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Medical History</Label><Textarea value={profile.medicalHistory ?? ""} onChange={e => updateField("medicalHistory", e.target.value || null)} placeholder="Past conditions, surgeries, etc." className="mt-1" /></div>
            <div><Label>Family History</Label><Textarea value={profile.familyHistory ?? ""} onChange={e => updateField("familyHistory", e.target.value || null)} placeholder="Relevant family medical history" className="mt-1" /></div>
            <div><Label>Allergies</Label><Textarea value={profile.allergies ?? ""} onChange={e => updateField("allergies", e.target.value || null)} placeholder="Known allergies" className="mt-1" /></div>
            <div><Label>Diagnoses</Label><Textarea value={profile.diagnoses ?? ""} onChange={e => updateField("diagnoses", e.target.value || null)} placeholder="Current diagnoses" className="mt-1" /></div>
          </div>

          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? "Saving..." : saved ? "Saved!" : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div><Label>Goal *</Label><Input value={goalTitle} onChange={e => setGoalTitle(e.target.value)} placeholder="e.g. Reach 12% body fat" className="mt-1" /></div>
            <div><Label>Description</Label><Input value={goalDescription} onChange={e => setGoalDescription(e.target.value)} className="mt-1" /></div>
            <div>
              <Label>Category</Label>
              <select value={goalCategory} onChange={e => setGoalCategory(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="health">Health</option>
                <option value="body_composition">Body Composition</option>
                <option value="performance">Performance</option>
                <option value="metabolic">Metabolic</option>
                <option value="longevity">Longevity</option>
                <option value="recovery">Recovery</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <Button onClick={handleAddGoal} disabled={!goalTitle}>Add Goal</Button>
        </CardContent>
      </Card>
    </div>
  );
}
