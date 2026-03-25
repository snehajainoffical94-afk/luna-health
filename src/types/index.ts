// =============================================
// LUNA HEALTH — Shared TypeScript Types
// =============================================

export interface User {
  id: string;
  email: string;
  telegram_chat_id?: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  age?: number | null;
  gender?: "male" | "female" | "other" | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  activity_level?: "sedentary" | "light" | "moderate" | "active" | "very_active" | null;
  medical_history?: string | null;
  goals?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Upload {
  id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  file_type: "pdf" | "image" | "other";
  upload_source: "web" | "telegram";
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
}

export interface OcrResult {
  id: string;
  upload_id: string;
  raw_text: string;
  processing_status: "pending" | "done" | "failed";
  created_at: string;
}

export interface Biomarker {
  id: string;
  user_id: string;
  upload_id?: string | null;
  marker_name: string;
  value: number;
  unit: string;
  ref_range_low?: number | null;
  ref_range_high?: number | null;
  status: "low" | "normal" | "high" | "unknown";
  test_date?: string | null;
  created_at: string;
}

export interface AnthropometricData {
  id: string;
  user_id: string;
  height_cm?: number | null;
  weight_kg?: number | null;
  bmi?: number | null;
  body_fat_pct?: number | null;
  waist_cm?: number | null;
  hip_cm?: number | null;
  measurement_date: string;
  created_at: string;
}

export interface WearableMetrics {
  id: string;
  user_id: string;
  date: string;
  resting_hr?: number | null;
  max_hr?: number | null;
  hrv_ms?: number | null;
  sleep_hours?: number | null;
  sleep_score?: number | null;
  recovery_score?: number | null;
  activity_score?: number | null;
  steps?: number | null;
  spo2?: number | null;
  skin_temp_c?: number | null;
  stress_score?: number | null;
  created_at: string;
}

export interface WeeklySummary {
  id: string;
  user_id: string;
  week_start_date: string;
  overall_score?: number | null;
  health_summary: string;
  training_guidance: string;
  recovery_guidance: string;
  sleep_guidance: string;
  nutrition_guidance: string;
  msk_implications: string;
  doctor_consultation_needed: boolean;
  doctor_reason?: string | null;
  prev_week_comparison?: string | null;
  sent_telegram: boolean;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  type: string;
  channel: "telegram" | "email" | "web";
  message_preview?: string | null;
  status: "sent" | "failed" | "pending";
  sent_at: string;
}

// Biomarker categories for UI
export type BiomarkerCategory =
  | "vitamins"
  | "minerals"
  | "hormones"
  | "thyroid"
  | "liver"
  | "kidney"
  | "lipids"
  | "blood_sugar"
  | "cbc"
  | "inflammation"
  | "iron"
  | "other";

export interface BiomarkerMeta {
  name: string;
  display_name: string;
  category: BiomarkerCategory;
  unit: string;
  ref_low: number;
  ref_high: number;
  description: string;
  low_implications: string;
  high_implications: string;
}

export interface HealthSummaryInput {
  profile: Profile;
  biomarkers: Biomarker[];
  wearable: WearableMetrics[];
  anthropometric: AnthropometricData | null;
  previousSummary?: WeeklySummary | null;
}
