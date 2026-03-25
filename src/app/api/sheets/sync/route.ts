import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const supabaseAdmin = () =>
  createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    return NextResponse.json({ skipped: true, reason: "Google Sheets not configured" });
  }

  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const admin = supabaseAdmin();

    const [bioRes, wearRes] = await Promise.all([
      admin.from("biomarkers").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
      admin.from("wearable_metrics").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(30),
    ]);

    // Dynamic import googleapis
    const { google } = await import("googleapis");

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const sheetId = process.env.GOOGLE_SHEETS_ID;

    // Write biomarkers to sheet
    if (bioRes.data && bioRes.data.length > 0) {
      const rows = bioRes.data.map((b) => [
        userId, b.marker_name, b.value, b.unit, b.status, b.test_date, b.created_at,
      ]);

      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: "Biomarkers!A:G",
        valueInputOption: "RAW",
        requestBody: { values: rows },
      });
    }

    return NextResponse.json({ success: true, synced: { biomarkers: bioRes.data?.length ?? 0 } });
  } catch (err) {
    console.error("Sheets sync error:", err);
    return NextResponse.json({ error: "Sheets sync failed" }, { status: 500 });
  }
}
