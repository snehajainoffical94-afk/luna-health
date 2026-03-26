// =============================================
// LUNA HEALTH — Gemini-powered biomarker extractor
// Works with raw text (PDF) or image bytes
// =============================================

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface GeminiBiomarker {
  marker_name: string;
  display_name: string;
  value: number;
  unit: string;
  ref_range_low: number | null;
  ref_range_high: number | null;
  status: "low" | "normal" | "high" | "unknown";
}

const EXTRACTION_PROMPT = `You are a medical data extraction AI. Extract ALL biomarkers/test results from this health report.

Return ONLY a JSON array with no extra text, markdown, or explanation. Each item must have:
- marker_name: lowercase normalized name (e.g. "hemoglobin", "vitamin d", "tsh")
- display_name: proper display name (e.g. "Hemoglobin", "Vitamin D (25-OH)", "TSH")
- value: numeric value as a number (not string)
- unit: unit of measurement (e.g. "g/dL", "ng/mL", "mIU/L", "%")
- ref_range_low: lower bound of reference range as number, or null if not available
- ref_range_high: upper bound of reference range as number, or null if not available
- status: "low" if below ref range, "high" if above ref range, "normal" if within range, "unknown" if no ref range

Extract EVERY test result you can find — blood count, vitamins, hormones, liver, kidney, lipids, thyroid, inflammation markers, etc.
If you cannot find a reference range, set ref_range_low and ref_range_high to null and status to "unknown".

Example output format:
[
  {"marker_name":"hemoglobin","display_name":"Hemoglobin","value":14.2,"unit":"g/dL","ref_range_low":12,"ref_range_high":17.5,"status":"normal"},
  {"marker_name":"vitamin d","display_name":"Vitamin D (25-OH)","value":18.5,"unit":"ng/mL","ref_range_low":30,"ref_range_high":100,"status":"low"}
]

Health report data:`;

export async function extractBiomarkersFromText(rawText: string): Promise<GeminiBiomarker[]> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json", maxOutputTokens: 2048, temperature: 0.1 },
  });

  const result = await model.generateContent(EXTRACTION_PROMPT + "\n\n" + rawText);
  return parseGeminiResponse(result.response.text());
}

export async function extractBiomarkersFromImage(
  imageBuffer: Buffer,
  mimeType: "image/jpeg" | "image/png" | "image/jpg"
): Promise<GeminiBiomarker[]> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json", maxOutputTokens: 2048, temperature: 0.1 },
  });

  const result = await model.generateContent([
    EXTRACTION_PROMPT,
    {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: mimeType === "image/jpg" ? "image/jpeg" : mimeType,
      },
    },
  ]);

  return parseGeminiResponse(result.response.text());
}

function parseGeminiResponse(text: string): GeminiBiomarker[] {
  try {
    const trimmed = text.trim();
    const start = trimmed.indexOf("[");
    const end = trimmed.lastIndexOf("]");
    if (start === -1 || end === -1) return [];
    const parsed = JSON.parse(trimmed.slice(start, end + 1));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item.marker_name &&
        typeof item.value === "number" &&
        !isNaN(item.value)
    );
  } catch {
    return [];
  }
}
