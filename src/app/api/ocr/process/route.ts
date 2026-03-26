import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { extractTextFromPDF } from "@/lib/ocr/pdfExtractor";
import { extractBiomarkersFromText, extractBiomarkersFromImage } from "@/lib/ai/geminiExtractor";

export const maxDuration = 60; // seconds (Vercel hobby max)

const supabaseAdmin = () =>
  createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function POST(req: NextRequest) {
  try {
    const { uploadId, userId: overrideUserId } = await req.json();
    if (!uploadId) return NextResponse.json({ error: "uploadId required" }, { status: 400 });

    const admin = supabaseAdmin();

    // Get upload record
    const { data: upload, error: uploadErr } = await admin
      .from("uploads")
      .select("*")
      .eq("id", uploadId)
      .single();

    if (uploadErr || !upload) return NextResponse.json({ error: "Upload not found" }, { status: 404 });

    const userId = overrideUserId ?? upload.user_id;

    // Mark as processing
    await admin.from("uploads").update({ status: "processing" }).eq("id", uploadId);

    // Download file directly via admin storage (works regardless of bucket privacy)
    const filePath = upload.file_url.split("/health-reports/")[1];
    const { data: fileData, error: downloadErr } = await admin.storage
      .from("health-reports")
      .download(filePath);

    if (downloadErr || !fileData) {
      // Fallback: try fetching from public URL
      const response = await fetch(upload.file_url);
      if (!response.ok) {
        await admin.from("uploads").update({ status: "failed" }).eq("id", uploadId);
        return NextResponse.json({ error: "Could not download file from storage" }, { status: 422 });
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      return await processBuffer(buffer, upload, userId, uploadId, admin);
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    return await processBuffer(buffer, upload, userId, uploadId, admin);

  } catch (err: unknown) {
    console.error("OCR error:", err);
    const msg = err instanceof Error ? err.message : "OCR processing failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function processBuffer(
  buffer: Buffer,
  upload: Record<string, string>,
  userId: string,
  uploadId: string,
  admin: ReturnType<typeof createAdminClient>
) {
  let biomarkers: Awaited<ReturnType<typeof extractBiomarkersFromText>> = [];
  let rawText = "";

  if (upload.file_type === "pdf") {
    // Extract text from PDF, then use Gemini to parse biomarkers
    rawText = await extractTextFromPDF(buffer);
    if (!rawText || rawText.trim().length < 10) {
      await admin.from("uploads").update({ status: "failed" }).eq("id", uploadId);
      return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 422 });
    }
    biomarkers = await extractBiomarkersFromText(rawText);
  } else {
    // Image: use Gemini Vision directly (no tesseract needed)
    const mimeType = upload.file_type === "image/png" ? "image/png" : "image/jpeg";
    biomarkers = await extractBiomarkersFromImage(buffer, mimeType as "image/jpeg" | "image/png");
    rawText = `[Image processed via Gemini Vision — ${biomarkers.length} biomarkers extracted]`;
  }

  // Save raw OCR result
  await admin.from("ocr_results").insert({
    upload_id: uploadId,
    raw_text: rawText.slice(0, 10000),
    processing_status: "done",
  });

  // Save biomarkers
  if (biomarkers.length > 0) {
    const today = new Date().toISOString().split("T")[0];
    const { error: insertErr } = await admin.from("biomarkers").insert(
      biomarkers.map((b) => ({
        user_id: userId,
        upload_id: uploadId,
        marker_name: b.marker_name,
        value: b.value,
        unit: b.unit,
        ref_range_low: b.ref_range_low,
        ref_range_high: b.ref_range_high,
        status: b.status,
        test_date: today,
      }))
    );
    if (insertErr) throw new Error(`Biomarker save error: ${insertErr.message}`);
  }

  // Mark upload complete
  await admin.from("uploads").update({ status: "completed" }).eq("id", uploadId);

  return NextResponse.json({
    success: true,
    biomarkerCount: biomarkers.length,
    rawTextLength: rawText.length,
  });
}
