// =============================================
// LUNA HEALTH — AI Health Agent (Claude-powered)
// =============================================

import Anthropic from "@anthropic-ai/sdk";
import { buildHealthSummaryPrompt } from "./summaryPrompts";
import type { HealthSummaryInput, WeeklySummary } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface GeneratedSummary {
  overall_score: number;
  health_summary: string;
  training_guidance: string;
  recovery_guidance: string;
  sleep_guidance: string;
  nutrition_guidance: string;
  msk_implications: string;
  doctor_consultation_needed: boolean;
  doctor_reason: string | null;
  prev_week_comparison: string | null;
}

export async function generateHealthSummary(
  input: HealthSummaryInput
): Promise<GeneratedSummary> {
  const prompt = buildHealthSummaryPrompt(input);

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type from Claude");

  // Parse JSON response
  const text = content.text.trim();
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) throw new Error("No valid JSON in Claude response");

  const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as GeneratedSummary;

  // Validate required fields
  const required = ["health_summary", "training_guidance", "recovery_guidance", "sleep_guidance", "nutrition_guidance", "msk_implications"];
  for (const field of required) {
    if (!parsed[field as keyof GeneratedSummary]) throw new Error(`Missing field: ${field}`);
  }

  return parsed;
}

export function formatSummaryForTelegram(summary: GeneratedSummary, userName: string, weekStart: string): string {
  const score = summary.overall_score ?? "—";
  const doctorFlag = summary.doctor_consultation_needed ? "\n\n⚠️ *Doctor Consultation Recommended*\n" + summary.doctor_reason : "";
  const prevWeek = summary.prev_week_comparison ? `\n\n📊 *vs Last Week*\n${summary.prev_week_comparison}` : "";

  return `🌙 *Luna Health Weekly Brief*
Week of ${weekStart} · Score: ${score}/100

👋 Hi ${userName}!

📋 *Health Summary*
${summary.health_summary}

🏋️ *Training This Week*
${summary.training_guidance}

💤 *Recovery & Sleep*
${summary.recovery_guidance}

🥗 *Nutrition Guidance*
${summary.nutrition_guidance}

🦴 *MSK & Physical Health*
${summary.msk_implications}
${prevWeek}${doctorFlag}

---
_Luna Health Intelligence · Powered by AI_
_View full summary: ${process.env.NEXT_PUBLIC_APP_URL}/weekly-summary_`;
}
