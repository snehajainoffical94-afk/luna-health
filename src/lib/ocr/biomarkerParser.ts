// =============================================
// LUNA HEALTH — Biomarker Parser
// Extracts structured biomarker data from raw OCR text
// =============================================

import type { BiomarkerMeta } from "@/types";

export const BIOMARKER_META: Record<string, BiomarkerMeta> = {
  "vitamin d": { name: "vitamin d", display_name: "Vitamin D (25-OH)", category: "vitamins", unit: "ng/mL", ref_low: 30, ref_high: 100, description: "Fat-soluble vitamin essential for bone health, immunity, and mood.", low_implications: "Risk of bone loss, fatigue, poor immunity, impaired sleep, and MSK issues.", high_implications: "Toxicity risk at very high levels — rare from food/sun." },
  "vitamin b12": { name: "vitamin b12", display_name: "Vitamin B12", category: "vitamins", unit: "pg/mL", ref_low: 200, ref_high: 900, description: "Essential for nerve function, red blood cell production, and DNA synthesis.", low_implications: "Fatigue, nerve damage, anaemia, cognitive decline, poor recovery.", high_implications: "Usually benign; check for liver disease if very high." },
  "ferritin": { name: "ferritin", display_name: "Ferritin", category: "iron", unit: "ng/mL", ref_low: 12, ref_high: 150, description: "Iron storage protein — key indicator of iron reserves.", low_implications: "Iron-deficiency risk, fatigue, reduced endurance, hair loss, poor recovery.", high_implications: "Inflammation, haemochromatosis, liver disease." },
  "hemoglobin": { name: "hemoglobin", display_name: "Hemoglobin", category: "cbc", unit: "g/dL", ref_low: 12, ref_high: 17.5, description: "Oxygen-carrying protein in red blood cells.", low_implications: "Anaemia, fatigue, shortness of breath, poor athletic performance.", high_implications: "Dehydration, polycythaemia." },
  "hba1c": { name: "hba1c", display_name: "HbA1c", category: "blood_sugar", unit: "%", ref_low: 4, ref_high: 5.7, description: "3-month average blood sugar control marker.", low_implications: "Risk of hypoglycaemia.", high_implications: "Pre-diabetes or diabetes. Cardiovascular risk elevated." },
  "fasting glucose": { name: "fasting glucose", display_name: "Fasting Glucose", category: "blood_sugar", unit: "mg/dL", ref_low: 70, ref_high: 100, description: "Blood sugar level after fasting.", low_implications: "Hypoglycaemia — dizziness, confusion, shakiness.", high_implications: "Pre-diabetes or diabetes risk. Metabolic dysfunction." },
  "tsh": { name: "tsh", display_name: "TSH (Thyroid)", category: "thyroid", unit: "mIU/L", ref_low: 0.4, ref_high: 4.0, description: "Thyroid stimulating hormone — controls thyroid function.", low_implications: "Hyperthyroidism — rapid HR, weight loss, anxiety, sleep issues.", high_implications: "Hypothyroidism — fatigue, weight gain, cold intolerance, depression." },
  "t3": { name: "t3", display_name: "T3 (Triiodothyronine)", category: "thyroid", unit: "pg/mL", ref_low: 2.3, ref_high: 4.2, description: "Active thyroid hormone regulating metabolism.", low_implications: "Hypothyroid symptoms — fatigue, cold intolerance, slow metabolism.", high_implications: "Hyperthyroid symptoms — heat intolerance, palpitations." },
  "t4": { name: "t4", display_name: "T4 (Thyroxine)", category: "thyroid", unit: "ng/dL", ref_low: 0.8, ref_high: 1.8, description: "Precursor thyroid hormone converted to active T3.", low_implications: "Hypothyroidism signal.", high_implications: "Hyperthyroidism signal." },
  "ldl": { name: "ldl", display_name: "LDL Cholesterol", category: "lipids", unit: "mg/dL", ref_low: 0, ref_high: 100, description: "Low-density lipoprotein — 'bad' cholesterol.", low_implications: "Very low LDL may affect hormone production.", high_implications: "Elevated cardiovascular disease risk. Lifestyle intervention needed." },
  "hdl": { name: "hdl", display_name: "HDL Cholesterol", category: "lipids", unit: "mg/dL", ref_low: 40, ref_high: 200, description: "High-density lipoprotein — 'good' cholesterol.", low_implications: "Increased cardiovascular risk.", high_implications: "Protective — generally good." },
  "total cholesterol": { name: "total cholesterol", display_name: "Total Cholesterol", category: "lipids", unit: "mg/dL", ref_low: 0, ref_high: 200, description: "Total blood cholesterol level.", low_implications: "May indicate malnutrition or liver issues.", high_implications: "Cardiovascular risk — lifestyle and dietary intervention." },
  "triglycerides": { name: "triglycerides", display_name: "Triglycerides", category: "lipids", unit: "mg/dL", ref_low: 0, ref_high: 150, description: "Blood fat linked to diet, insulin resistance, and cardiovascular disease.", low_implications: "Rare concern.", high_implications: "Metabolic syndrome, pancreatitis risk, cardiovascular risk." },
  "creatinine": { name: "creatinine", display_name: "Creatinine", category: "kidney", unit: "mg/dL", ref_low: 0.6, ref_high: 1.2, description: "Waste product filtered by kidneys — kidney function marker.", low_implications: "Low muscle mass.", high_implications: "Kidney dysfunction. Requires monitoring." },
  "urea": { name: "urea", display_name: "Blood Urea Nitrogen", category: "kidney", unit: "mg/dL", ref_low: 7, ref_high: 20, description: "Protein metabolism byproduct filtered by kidneys.", low_implications: "Low protein intake or liver disease.", high_implications: "Kidney dysfunction or high protein diet." },
  "alt": { name: "alt", display_name: "ALT (Liver)", category: "liver", unit: "U/L", ref_low: 0, ref_high: 40, description: "Liver enzyme — elevated when liver cells are damaged.", low_implications: "Normal or good.", high_implications: "Liver stress — alcohol, medication, NAFLD." },
  "ast": { name: "ast", display_name: "AST (Liver)", category: "liver", unit: "U/L", ref_low: 0, ref_high: 40, description: "Liver enzyme — found in liver and muscle.", low_implications: "Normal.", high_implications: "Liver or muscle damage — check with ALT ratio." },
  "crp": { name: "crp", display_name: "CRP (C-Reactive Protein)", category: "inflammation", unit: "mg/L", ref_low: 0, ref_high: 3, description: "Inflammation marker. Elevated during infection, injury, or chronic inflammation.", low_implications: "Good — low systemic inflammation.", high_implications: "Active inflammation, infection, cardiovascular risk if chronically elevated." },
  "esr": { name: "esr", display_name: "ESR", category: "inflammation", unit: "mm/hr", ref_low: 0, ref_high: 20, description: "Erythrocyte sedimentation rate — non-specific inflammation marker.", low_implications: "Normal.", high_implications: "Inflammation, infection, autoimmune disease." },
  "iron": { name: "iron", display_name: "Serum Iron", category: "iron", unit: "mcg/dL", ref_low: 60, ref_high: 170, description: "Circulating iron in blood.", low_implications: "Iron deficiency — fatigue, poor recovery, reduced performance.", high_implications: "Iron overload — check ferritin and transferrin." },
  "cortisol": { name: "cortisol", display_name: "Cortisol", category: "hormones", unit: "mcg/dL", ref_low: 6, ref_high: 23, description: "Stress hormone from adrenal glands. Highest in morning.", low_implications: "Adrenal insufficiency, burnout, chronic fatigue.", high_implications: "Chronic stress, Cushing's syndrome, sleep disruption, immune suppression." },
  "testosterone": { name: "testosterone", display_name: "Total Testosterone", category: "hormones", unit: "ng/dL", ref_low: 300, ref_high: 1000, description: "Primary male sex hormone — affects muscle, recovery, mood.", low_implications: "Low energy, reduced muscle mass, poor recovery, low libido.", high_implications: "Anabolic steroid use, PCOS in women." },
};

const ALIASES: Record<string, string> = {
  "vit d": "vitamin d",
  "25-oh": "vitamin d",
  "25 oh": "vitamin d",
  "b12": "vitamin b12",
  "cobalamin": "vitamin b12",
  "hgb": "hemoglobin",
  "hb": "hemoglobin",
  "glucose": "fasting glucose",
  "blood glucose": "fasting glucose",
  "fbs": "fasting glucose",
  "total chol": "total cholesterol",
  "cholesterol": "total cholesterol",
  "trig": "triglycerides",
  "hdl-c": "hdl",
  "ldl-c": "ldl",
  "serum creatinine": "creatinine",
  "sgpt": "alt",
  "sgot": "ast",
  "s. ferritin": "ferritin",
  "serum ferritin": "ferritin",
  "serum iron": "iron",
};

function normalizeMarkerName(raw: string): string {
  const lower = raw.toLowerCase().trim();
  return ALIASES[lower] ?? lower;
}

function parseValue(str: string): number | null {
  const cleaned = str.replace(/,/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function getStatus(value: number, meta: BiomarkerMeta): "low" | "normal" | "high" {
  if (value < meta.ref_low) return "low";
  if (value > meta.ref_high) return "high";
  return "normal";
}

export interface ExtractedBiomarker {
  marker_name: string;
  display_name: string;
  value: number;
  unit: string;
  ref_range_low: number | null;
  ref_range_high: number | null;
  status: "low" | "normal" | "high" | "unknown";
}

export function extractBiomarkersFromText(text: string): ExtractedBiomarker[] {
  const results: ExtractedBiomarker[] = [];
  const seen = new Set<string>();

  // Pattern: Name ... value ... unit (flexible)
  // Handles formats like:
  //   Vitamin D 25.4 ng/mL (30-100)
  //   Ferritin: 12.3 ng/mL
  //   TSH 2.1 mIU/L [0.4-4.0]

  const patterns = [
    // "Marker Name: value unit [ref range]"
    /([A-Za-z][A-Za-z0-9\s\-\.()]+?)\s*[:\-]?\s*(\d+\.?\d*)\s*(ng\/mL|pg\/mL|mg\/dL|g\/dL|mIU\/L|U\/L|mcg\/dL|mm\/hr|ng\/dL|%|IU\/L|mmol\/L|mEq\/L|ng\/L|µg\/dL)\s*(?:[(\[][\d\.\s\-–<>]+[)\]])?/gi,
    // "Name value (ref low-high) unit"
    /([A-Za-z][A-Za-z0-9\s\-\.()]+?)\s+(\d+\.?\d*)\s*(?:[(\[][\d\.\s\-–]+[)\]])?\s*(ng\/mL|pg\/mL|mg\/dL|g\/dL|mIU\/L|U\/L|mcg\/dL|mm\/hr|ng\/dL|%)/gi,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const rawName = match[1].trim();
      const rawValue = match[2];
      const rawUnit = match[3];

      const normalized = normalizeMarkerName(rawName);
      if (seen.has(normalized)) continue;

      const value = parseValue(rawValue);
      if (value === null || value < 0 || value > 100000) continue;

      const meta = BIOMARKER_META[normalized];
      if (!meta) continue;

      seen.add(normalized);
      results.push({
        marker_name: normalized,
        display_name: meta.display_name,
        value,
        unit: rawUnit || meta.unit,
        ref_range_low: meta.ref_low,
        ref_range_high: meta.ref_high,
        status: getStatus(value, meta),
      });
    }
  }

  return results;
}
