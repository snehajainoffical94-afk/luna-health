import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { extractTextFromPDF } from "@/lib/ocr/pdfExtractor";
import { extractTextFromImage } from "@/lib/ocr/imageExtractor";
import { extractBiomarkersFromText } from "@/lib/ocr/biomarkerParser";

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

    // Fetch file from URL
    const response = await fetch(upload.file_url);
    if (!response.ok) throw new Error("Failed to fetch uploaded file");
    const buffer = Buffer.from(await response.arrayBuffer());

    // Extract text based on file type
    let rawText = "";
    if (upload.file_type === "pdf") {
      rawText = await extractTextFromPDF(buffer);
    } else {
      rawText = await extractTextFromImage(buffer);
    }

    if (!rawText || rawText.trim().length < 10) {
      await admin.from("uploads").update({ status: "failed" }).eq("id", uploadId);
      return NextResponse.json({ error: "Could not extract text from file" }, { status: 422 });
    }

    // Save raw OCR result
    await admin.from("ocr_results").insert({
      upload_id: uploadId,
      raw_text: rawText,
      processing_status: "done",
    });

    // Extract biomarkers
    const biomarkers = extractBiomarkersFromText(rawText);

    // Save biomarkers
    if (biomarkers.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      await admin.from("biomarkers").insert(
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
    }

    // Mark upload complete
    await admin.from("uploads").update({ status: "completed" }).eq("id", uploadId);

    // Trigger Google Sheets sync (async, non-blocking)
    if (process.env.GOOGLE_SHEETS_ID) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/sheets/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      biomarkerCount: biomarkers.length,
      rawTextLength: rawText.length,
    });
  } catch (err: unknown) {
    console.error("OCR error:", err);
    const msg = err instanceof Error ? err.message : "OCR processing failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
