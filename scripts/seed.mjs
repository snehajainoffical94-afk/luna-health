/**
 * LUNA HEALTH — Seed Script (ES Module version)
 * Run: node scripts/seed.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Load .env.local
const envText = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = {};
for (const line of envText.split("\n")) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const idx = trimmed.indexOf("=");
    if (idx > 0) env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  console.log("🌱 Seeding Luna Health demo data...\n");

  // 1. Create demo user
  let userId;
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: "demo@lunahealth.app",
    password: "demo123456",
    email_confirm: true,
    user_metadata: { name: "Arjun Mehta" },
  });

  if (authErr) {
    if (authErr.message.toLowerCase().includes("already")) {
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list?.users?.find((u) => u.email === "demo@lunahealth.app");
      if (!existing) { console.error("❌ Cannot find or create demo user"); process.exit(1); }
      userId = existing.id;
      console.log("ℹ️  Demo user already exists:", userId);
    } else {
      console.error("❌ Auth error:", authErr.message); process.exit(1);
    }
  } else {
    userId = authData.user.id;
    console.log("✅ Demo user created:", userId);
  }

  // 2. Profile
  const { error: profErr } = await supabase.from("profiles").upsert({
    user_id: userId, name: "Arjun Mehta", age: 32, gender: "male",
    height_cm: 178, weight_kg: 74, activity_level: "active",
    goals: "Improve energy, optimize recovery, run a sub-4h marathon",
    medical_history: "Mild vitamin D deficiency (previous diagnosis)",
  }, { onConflict: "user_id" });
  if (profErr) console.log("⚠️  Profile:", profErr.message); else console.log("✅ Profile seeded");

  // 3. Biomarkers
  const today = new Date().toISOString().split("T")[0];
  const { error: bioErr } = await supabase.from("biomarkers").insert([
    { user_id: userId, marker_name: "vitamin d", value: 18, unit: "ng/mL", ref_range_low: 30, ref_range_high: 100, status: "low", test_date: today },
    { user_id: userId, marker_name: "vitamin b12", value: 290, unit: "pg/mL", ref_range_low: 200, ref_range_high: 900, status: "normal", test_date: today },
    { user_id: userId, marker_name: "ferritin", value: 14, unit: "ng/mL", ref_range_low: 12, ref_range_high: 150, status: "normal", test_date: today },
    { user_id: userId, marker_name: "hemoglobin", value: 14.2, unit: "g/dL", ref_range_low: 13.5, ref_range_high: 17.5, status: "normal", test_date: today },
    { user_id: userId, marker_name: "hba1c", value: 5.4, unit: "%", ref_range_low: 4, ref_range_high: 5.7, status: "normal", test_date: today },
    { user_id: userId, marker_name: "tsh", value: 2.8, unit: "mIU/L", ref_range_low: 0.4, ref_range_high: 4.0, status: "normal", test_date: today },
    { user_id: userId, marker_name: "ldl", value: 138, unit: "mg/dL", ref_range_low: 0, ref_range_high: 100, status: "high", test_date: today },
    { user_id: userId, marker_name: "hdl", value: 52, unit: "mg/dL", ref_range_low: 40, ref_range_high: 200, status: "normal", test_date: today },
    { user_id: userId, marker_name: "triglycerides", value: 128, unit: "mg/dL", ref_range_low: 0, ref_range_high: 150, status: "normal", test_date: today },
    { user_id: userId, marker_name: "crp", value: 1.8, unit: "mg/L", ref_range_low: 0, ref_range_high: 3, status: "normal", test_date: today },
  ]);
  if (bioErr) console.log("⚠️  Biomarkers:", bioErr.message); else console.log("✅ 10 biomarkers seeded");

  // 4. Wearable metrics (7 days)
  const rows = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return {
      user_id: userId, date: d.toISOString().split("T")[0],
      resting_hr: 56 + Math.floor(Math.random() * 8),
      hrv_ms: 62 + Math.floor(Math.random() * 20),
      sleep_hours: +(6.5 + Math.round(Math.random() * 15) / 10).toFixed(1),
      sleep_score: 72 + Math.floor(Math.random() * 20),
      recovery_score: 70 + Math.floor(Math.random() * 25),
      activity_score: 60 + Math.floor(Math.random() * 30),
      steps: 7000 + Math.floor(Math.random() * 5000),
      spo2: 97 + Math.floor(Math.random() * 2),
      skin_temp_c: +(36.4 + Math.round(Math.random() * 4) / 10).toFixed(1),
      stress_score: 25 + Math.floor(Math.random() * 30),
    };
  });
  const { error: wearErr } = await supabase.from("wearable_metrics").upsert(rows, { onConflict: "user_id,date" });
  if (wearErr) console.log("⚠️  Wearable:", wearErr.message); else console.log("✅ 7 days wearable data seeded");

  // 5. Anthropometric
  const { error: anthErr } = await supabase.from("anthropometric_data").insert({
    user_id: userId, height_cm: 178, weight_kg: 74, bmi: 23.4,
    body_fat_pct: 16.2, waist_cm: 82, hip_cm: 96, measurement_date: today,
  });
  if (anthErr) console.log("⚠️  Anthropometric:", anthErr.message); else console.log("✅ Body metrics seeded");

  // 6. Weekly summary
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const { error: sumErr } = await supabase.from("weekly_summaries").upsert({
    user_id: userId,
    week_start_date: weekStart.toISOString().split("T")[0],
    overall_score: 72,
    health_summary: "Arjun, your overall health this week scores 72/100. The most significant finding from your blood panel is Vitamin D at 18 ng/mL — well below the optimal 30 ng/mL threshold. This is likely contributing to the slightly reduced recovery scores on your Luna ring (averaging 76%). Your LDL at 138 mg/dL warrants dietary attention, though HDL at 52 mg/dL provides good cardiovascular protection. HbA1c at 5.4% shows excellent blood sugar regulation.",
    training_guidance: "With HRV averaging 68ms and recovery scores at 76%, you have good capacity for moderate-to-high intensity training. Your low Vitamin D may impair muscle recovery and neuromuscular function slightly, so include one full rest day mid-week. Aim for 4 sessions: 2 strength, 1 tempo run, 1 easy aerobic. Avoid back-to-back high intensity days until Vitamin D improves.",
    recovery_guidance: "Recovery is good but not optimal. Low Vitamin D is likely impairing muscle repair. Prioritise sleep quality over duration. Post-workout nutrition within 45 minutes is critical — protein + carbohydrates. Cold exposure (2-3 min cold shower) can support recovery given your CRP at 1.8 mg/L is within normal range.",
    sleep_guidance: "Luna ring shows average sleep score of 78 with 7.2 hours/night — good but not exceptional. Vitamin D deficiency disrupts sleep architecture, particularly deep sleep. Take Vitamin D in the morning, not evening. Maintain consistent sleep/wake times for best results.",
    nutrition_guidance: "Priority: Start Vitamin D3 (2000-5000 IU daily with K2) and get 15-20 minutes midday sun. LDL at 138 mg/dL — reduce saturated fat, increase oily fish 3x/week. Triglycerides at 128 mg/dL — reduce refined carbohydrates.",
    msk_implications: "Vitamin D at 18 ng/mL has direct MSK implications — impairs calcium absorption and bone mineral density. May cause mild muscle weakness and slower tendon repair at high training volumes. Consider DEXA scan if Vitamin D remains low after 3 months of supplementation. No active MSK inflammation (CRP 1.8 mg/L is normal).",
    doctor_consultation_needed: false,
    doctor_reason: null,
    prev_week_comparison: null,
    sent_telegram: false,
  }, { onConflict: "user_id,week_start_date" });
  if (sumErr) console.log("⚠️  Summary:", sumErr.message); else console.log("✅ Weekly summary seeded");

  console.log("\n🎉 Done!");
  console.log("📧 Demo login: demo@lunahealth.app / demo123456\n");
}

seed().catch(console.error);
