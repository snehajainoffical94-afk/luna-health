import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { generateHealthSummary } from "@/lib/ai/healthAgent";
import { getWeekStart } from "@/lib/utils";
import type { HealthSummaryInput } from "@/types";

const supabaseAdmin = () =>
  createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function POST(req: NextRequest) {
  try {
    // Auth: allow either session user or service-role call (for cron)
    let userId: string;
    const body = await req.json().catch(() => ({}));
    const cronSecret = req.headers.get("x-cron-secret");

    if (cronSecret === process.env.CRON_SECRET && body.userId) {
      userId = body.userId;
    } else {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      userId = user.id;
    }

    const admin = supabaseAdmin();

    // Fetch all required data
    const [profileRes, biomarkersRes, wearableRes, anthropometricRes, prevSummaryRes] =
      await Promise.all([
        admin.from("profiles").select("*").eq("user_id", userId).single(),
        admin.from("biomarkers").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
        admin.from("wearable_metrics").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(7),
        admin.from("anthropometric_data").select("*").eq("user_id", userId).order("measurement_date", { ascending: false }).limit(1),
        admin.from("weekly_summaries").select("*").eq("user_id", userId).order("week_start_date", { ascending: false }).limit(1),
      ]);

    if (!profileRes.data) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const input: HealthSummaryInput = {
      profile: profileRes.data,
      biomarkers: biomarkersRes.data ?? [],
      wearable: wearableRes.data ?? [],
      anthropometric: anthropometricRes.data?.[0] ?? null,
      previousSummary: prevSummaryRes.data?.[0] ?? null,
    };

    // Generate with Claude
    const generated = await generateHealthSummary(input);

    const weekStart = getWeekStart();

    // Save to DB
    const { data: savedSummary, error: saveErr } = await admin
      .from("weekly_summaries")
      .upsert(
        {
          user_id: userId,
          week_start_date: weekStart,
          overall_score: generated.overall_score,
          health_summary: generated.health_summary,
          training_guidance: generated.training_guidance,
          recovery_guidance: generated.recovery_guidance,
          sleep_guidance: generated.sleep_guidance,
          nutrition_guidance: generated.nutrition_guidance,
          msk_implications: generated.msk_implications,
          doctor_consultation_needed: generated.doctor_consultation_needed,
          doctor_reason: generated.doctor_reason,
          prev_week_comparison: generated.prev_week_comparison,
          sent_telegram: false,
        },
        { onConflict: "user_id,week_start_date" }
      )
      .select("id")
      .single();

    if (saveErr) throw new Error(saveErr.message);

    return NextResponse.json({ success: true, summaryId: savedSummary.id, weekStart });
  } catch (err: unknown) {
    console.error("Summary generation error:", err);
    const msg = err instanceof Error ? err.message : "Summary generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
