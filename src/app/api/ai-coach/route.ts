import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const admin = () =>
  createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, userId: telegramUserId } = body;

    if (!question?.trim()) {
      return NextResponse.json({ error: "No question provided" }, { status: 400 });
    }

    // Auth: session user (website) or userId passed from Telegram handler
    let userId: string;
    if (telegramUserId) {
      userId = telegramUserId;
    } else {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      userId = user.id;
    }

    const db = admin();

    // Fetch all user health data in parallel
    const [profileRes, biomarkersRes, wearableRes, anthropometricRes, summaryRes] =
      await Promise.all([
        db.from("profiles").select("*").eq("user_id", userId).single(),
        db.from("biomarkers").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
        db.from("wearable_metrics").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(14),
        db.from("anthropometric_data").select("*").eq("user_id", userId).order("measurement_date", { ascending: false }).limit(3),
        db.from("weekly_summaries").select("*").eq("user_id", userId).order("week_start_date", { ascending: false }).limit(2),
      ]);

    const profile = profileRes.data;
    const biomarkers = biomarkersRes.data ?? [];
    const wearable = wearableRes.data ?? [];
    const anthropometric = anthropometricRes.data ?? [];
    const summaries = summaryRes.data ?? [];

    // Build context
    const context = buildContext(profile, biomarkers, wearable, anthropometric, summaries);

    const prompt = `You are Luna Health AI Coach — a knowledgeable, friendly health and fitness advisor.
You have access to the user's complete health data below. Answer their question based on this data.
Be specific, practical, and reference their actual numbers when relevant.
Keep responses concise (3-5 sentences for simple questions, up to 10 sentences for complex ones).
If you recommend seeing a doctor, say so clearly.

--- USER HEALTH DATA ---
${context}
--- END DATA ---

User's question: ${question}

Answer:`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { maxOutputTokens: 1024, temperature: 0.5 },
    });

    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim();

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("AI coach error:", err);
    const msg = err instanceof Error ? err.message : "AI coach failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function buildContext(
  profile: Record<string, unknown> | null,
  biomarkers: Record<string, unknown>[],
  wearable: Record<string, unknown>[],
  anthropometric: Record<string, unknown>[],
  summaries: Record<string, unknown>[]
): string {
  const lines: string[] = [];

  if (profile) {
    lines.push(`PROFILE: Name=${profile.name}, Age=${profile.age ?? "unknown"}, Sex=${profile.sex ?? "unknown"}, Goals=${profile.health_goals ?? "not set"}`);
  }

  if (biomarkers.length > 0) {
    lines.push("\nBIOMARKERS (latest blood test results):");
    for (const b of biomarkers) {
      lines.push(`  ${b.marker_name}: ${b.value} ${b.unit} [${b.status}] (ref: ${b.reference_range ?? "N/A"})`);
    }
  }

  if (wearable.length > 0) {
    lines.push("\nWEARABLE DATA (last 14 days):");
    for (const w of wearable) {
      lines.push(`  ${w.date}: HR=${w.resting_hr ?? "—"} bpm, HRV=${w.hrv_ms ?? "—"} ms, Sleep=${w.sleep_hours ?? "—"} hrs, Recovery=${w.recovery_score ?? "—"}%, Steps=${w.steps ?? "—"}, SpO2=${w.spo2 ?? "—"}%`);
    }
  }

  if (anthropometric.length > 0) {
    lines.push("\nBODY METRICS:");
    for (const a of anthropometric) {
      lines.push(`  ${a.measurement_date}: Weight=${a.weight_kg ?? "—"} kg, Height=${a.height_cm ?? "—"} cm, Body Fat=${a.body_fat_percent ?? "—"}%, Muscle=${a.muscle_mass_kg ?? "—"} kg`);
    }
  }

  if (summaries.length > 0) {
    lines.push("\nLATEST WEEKLY SUMMARY:");
    const s = summaries[0] as Record<string, unknown>;
    lines.push(`  Week of ${s.week_start_date}, Score: ${s.overall_score}/100`);
    lines.push(`  Summary: ${s.health_summary}`);
    if (s.training_guidance) lines.push(`  Training: ${s.training_guidance}`);
  }

  return lines.join("\n") || "No health data available yet.";
}
