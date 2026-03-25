/**
 * LUNA HEALTH — Seed Script
 * Creates a demo user with sample data for testing the full flow
 * Run: npx ts-node scripts/seed.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE env vars. Copy .env.example to .env.local first.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function seed() {
  console.log("🌱 Seeding demo data...\n");

  // 1. Create demo user
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: "demo@lunahealth.app",
    password: "demo123456",
    email_confirm: true,
    user_metadata: { name: "Arjun Mehta" },
  });

  if (authErr && !authErr.message.includes("already registered")) {
    console.error("Auth error:", authErr.message);
    process.exit(1);
  }

  const userId = authData?.user?.id;
  if (!userId) {
    // User may already exist — fetch them
    const { data: existing } = await supabase.auth.admin.listUsers();
    const existingUser = existing?.users?.find((u) => u.email === "demo@lunahealth.app");
    if (!existingUser) { console.error("Could not create or find demo user"); process.exit(1); }
    console.log("ℹ️  Demo user already exists, using existing ID:", existingUser.id);
    await seedData(existingUser.id);
  } else {
    console.log("✅ Demo user created:", userId);
    await seedData(userId);
  }
}

async function seedData(userId: string) {
  // Profile
  await supabase.from("profiles").upsert({
    user_id: userId, name: "Arjun Mehta", age: 32, gender: "male",
    height_cm: 178, weight_kg: 74, activity_level: "active",
    goals: "Improve energy, optimize recovery, run a sub-4h marathon",
    medical_history: "Mild vitamin D deficiency (prev diagnosis)",
  }, { onConflict: "user_id" });
  console.log("✅ Profile seeded");

  // Biomarkers (simulating extracted blood report)
  const today = new Date().toISOString().split("T")[0];
  await supabase.from("biomarkers").insert([
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
  console.log("✅ Biomarkers seeded (10 markers)");

  // Wearable metrics (last 7 days)
  const wearableRows = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    return {
      user_id: userId, date: dateStr,
      resting_hr: 56 + Math.floor(Math.random() * 8),
      max_hr: 138 + Math.floor(Math.random() * 20),
      hrv_ms: 62 + Math.floor(Math.random() * 20),
      sleep_hours: 6.5 + Math.round(Math.random() * 15) / 10,
      sleep_score: 72 + Math.floor(Math.random() * 20),
      recovery_score: 70 + Math.floor(Math.random() * 25),
      activity_score: 60 + Math.floor(Math.random() * 30),
      steps: 7000 + Math.floor(Math.random() * 5000),
      spo2: 97 + Math.floor(Math.random() * 2),
      skin_temp_c: 36.4 + Math.round(Math.random() * 4) / 10,
      stress_score: 25 + Math.floor(Math.random() * 30),
    };
  });
  await supabase.from("wearable_metrics").upsert(wearableRows, { onConflict: "user_id,date" });
  console.log("✅ Wearable metrics seeded (7 days)");

  // Anthropometric
  await supabase.from("anthropometric_data").insert({
    user_id: userId, height_cm: 178, weight_kg: 74, bmi: 23.4,
    body_fat_pct: 16.2, waist_cm: 82, hip_cm: 96,
    measurement_date: today,
  });
  console.log("✅ Anthropometric data seeded");

  // Sample weekly summary
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  await supabase.from("weekly_summaries").upsert({
    user_id: userId,
    week_start_date: weekStart.toISOString().split("T")[0],
    overall_score: 72,
    health_summary: "Arjun, your overall health this week is solid with a score of 72/100. The most significant finding from your blood panel is your Vitamin D at 18 ng/mL — well below the optimal threshold of 30 ng/mL. This single marker could be contributing to the slightly lower recovery scores you've been seeing on your Luna ring this week (averaging 76%). Your lipid panel shows LDL at 138 mg/dL which warrants dietary attention, though your HDL at 52 mg/dL provides good cardiovascular protection. HbA1c at 5.4% indicates excellent blood sugar regulation — keep that up.",
    training_guidance: "With your recovery scores averaging 76% and HRV hovering around 68ms, you have good capacity for moderate-to-high intensity training this week. Your low Vitamin D may be slightly impairing muscle recovery and neuromuscular function, so prioritize one full rest day mid-week. Aim for 4 training sessions: 2 strength, 1 tempo run, 1 easy aerobic. Avoid back-to-back high intensity days until your Vitamin D improves.",
    recovery_guidance: "Your recovery metrics are good but not optimal. The low Vitamin D is likely contributing to slightly impaired muscle repair. Prioritize sleep quality over duration this week. Post-workout nutrition within 45 minutes is critical — include protein and some carbohydrates. Cold exposure (2-3 min cold shower) can support recovery given your current inflammatory markers look controlled (CRP 1.8 mg/L is within normal range).",
    sleep_guidance: "Your Luna ring shows an average sleep score of 78 over the past 7 days with 7.2 hours per night — good but not exceptional. Vitamin D deficiency is known to disrupt sleep architecture, particularly deep sleep stages. Consider taking your Vitamin D supplement in the morning (not evening) as it may interfere with melatonin production at night. Maintain consistent sleep/wake times.",
    nutrition_guidance: "Priority action: Start Vitamin D3 supplementation (2000-5000 IU daily with K2) and get 15-20 minutes of midday sun exposure. Your LDL at 138 mg/dL suggests reducing saturated fat intake — limit red meat to 2x/week and increase oily fish (salmon, mackerel) to 3x/week for omega-3s. Your triglycerides at 128 mg/dL are in range but trending — reduce refined carbohydrates and alcohol.",
    msk_implications: "Your low Vitamin D at 18 ng/mL has direct musculoskeletal implications. Vitamin D is critical for calcium absorption and bone mineral density. At this level, you may experience mild muscle weakness, slower tendon repair, and increased risk of stress reactions if training volume is high. Bone health should be monitored — consider a DEXA scan if Vitamin D remains low after supplementation for 3 months. Your inflammation markers (CRP 1.8 mg/L) are within range, suggesting no active MSK inflammation currently.",
    doctor_consultation_needed: false,
    doctor_reason: null,
    prev_week_comparison: null,
    sent_telegram: false,
  }, { onConflict: "user_id,week_start_date" });
  console.log("✅ Weekly summary seeded");

  console.log("\n🎉 Demo data seeded successfully!");
  console.log("📧 Login: demo@lunahealth.app / demo123456");
}

seed().catch(console.error);
