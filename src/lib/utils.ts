import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function severityColor(severity: number): string {
  if (severity <= 3) return "text-green-400";
  if (severity <= 5) return "text-yellow-400";
  if (severity <= 7) return "text-orange-400";
  return "text-red-400";
}

export function confidenceBadge(confidence: string): string {
  switch (confidence) {
    case "high":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "moderate":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "low":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    default:
      return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  }
}
