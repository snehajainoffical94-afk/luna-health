import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function getBiomarkerStatusColor(status: string): string {
  switch (status) {
    case "low":
      return "text-blue-400";
    case "high":
      return "text-red-400";
    case "normal":
      return "text-green-400";
    default:
      return "text-gray-400";
  }
}

export function getBiomarkerStatusBg(status: string): string {
  switch (status) {
    case "low":
      return "bg-blue-400/10 text-blue-400 border-blue-400/20";
    case "high":
      return "bg-red-400/10 text-red-400 border-red-400/20";
    case "normal":
      return "bg-green-400/10 text-green-400 border-green-400/20";
    default:
      return "bg-gray-400/10 text-gray-400 border-gray-400/20";
  }
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function getWeekStart(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

export function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen) + "..." : str;
}
