"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createMeal, deleteMeal } from "@/lib/actions";
import { Trash2 } from "lucide-react";

interface MealData {
  id: string;
  date: string;
  time: string | null;
  mealType: string;
  description: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
}

export default function NutritionPage() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [mealType, setMealType] = useState("lunch");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState<number | "">("");
  const [protein, setProtein] = useState<number | "">("");
  const [carbs, setCarbs] = useState<number | "">("");
  const [fat, setFat] = useState<number | "">("");
  const [fiber, setFiber] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [time, setTime] = useState("");
  const [meals, setMeals] = useState<MealData[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/meals?days=7`).then(r => r.json()).then(setMeals).catch(() => {});
  }, [saving]);

  async function handleSave() {
    setSaving(true);
    await createMeal({
      date,
      time: time || undefined,
      mealType,
      description: description || undefined,
      calories: calories || undefined,
      protein: protein || undefined,
      carbs: carbs || undefined,
      fat: fat || undefined,
      fiber: fiber || undefined,
      notes: notes || undefined,
    });
    setDescription("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setFiber("");
    setNotes("");
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await deleteMeal(id);
    setMeals(meals.filter(m => m.id !== id));
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nutrition</h1>
        <p className="text-muted-foreground text-sm">Log meals and track macros</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log a Meal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Meal Type</Label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
                <option value="pre-workout">Pre-Workout</option>
                <option value="post-workout">Post-Workout</option>
              </select>
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What did you eat?" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <Label>Calories</Label>
              <Input type="number" value={calories} onChange={(e) => setCalories(e.target.value ? Number(e.target.value) : "")} className="mt-1" />
            </div>
            <div>
              <Label>Protein (g)</Label>
              <Input type="number" value={protein} onChange={(e) => setProtein(e.target.value ? Number(e.target.value) : "")} className="mt-1" />
            </div>
            <div>
              <Label>Carbs (g)</Label>
              <Input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value ? Number(e.target.value) : "")} className="mt-1" />
            </div>
            <div>
              <Label>Fat (g)</Label>
              <Input type="number" value={fat} onChange={(e) => setFat(e.target.value ? Number(e.target.value) : "")} className="mt-1" />
            </div>
            <div>
              <Label>Fiber (g)</Label>
              <Input type="number" value={fiber} onChange={(e) => setFiber(e.target.value ? Number(e.target.value) : "")} className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes" className="mt-1" />
          </div>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Log Meal"}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Meals</CardTitle>
        </CardHeader>
        <CardContent>
          {meals.length === 0 && <p className="text-sm text-muted-foreground">No meals logged yet</p>}
          <div className="space-y-3">
            {meals.map((m) => (
              <div key={m.id} className="flex items-start justify-between border-b border-border pb-3 last:border-0">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{m.mealType}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(m.date).toLocaleDateString()} {m.time ?? ""}
                    </span>
                  </div>
                  {m.description && <p className="text-sm mt-1">{m.description}</p>}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {m.calories ? `${m.calories} cal` : ""}
                    {m.protein ? ` · P:${m.protein}g` : ""}
                    {m.carbs ? ` · C:${m.carbs}g` : ""}
                    {m.fat ? ` · F:${m.fat}g` : ""}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
