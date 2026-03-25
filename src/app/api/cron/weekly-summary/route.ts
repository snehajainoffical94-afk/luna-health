import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { sendTelegramMessage } from "@/lib/telegram/bot";
import { formatSummaryForTelegram } from "@/lib/ai/healthAgent";
import { getWeekStart } from "@/lib/utils";

const supabaseAdmin = () =>
  createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sends authorization header)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = supabaseAdmin();
  const weekStart = getWeekStart();

  // Get all users with telegram linked
  const { data: profiles } = await admin
    .from("profiles")
    .select("user_id, name, telegram_chat_id")
    .not("telegram_chat_id", "is", null);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ message: "No linked users found" });
  }

  const results = { success: 0, failed: 0, skipped: 0 };

  for (const profile of profiles) {
    try {
      // Generate summary for this user
      const summaryRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/summaries/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cron-secret": process.env.CRON_SECRET!,
        },
        body: JSON.stringify({ userId: profile.user_id }),
      });

      if (!summaryRes.ok) { results.failed++; continue; }

      const { summaryId } = await summaryRes.json();

      // Fetch the generated summary
      const { data: summary } = await admin
        .from("weekly_summaries")
        .select("*")
        .eq("id", summaryId)
        .single();

      if (!summary) { results.skipped++; continue; }

      // Format and send via Telegram
      const message = formatSummaryForTelegram(summary, profile.name, weekStart);
      await sendTelegramMessage(profile.telegram_chat_id, message);

      // Mark as sent
      await admin
        .from("weekly_summaries")
        .update({ sent_telegram: true })
        .eq("id", summaryId);

      // Log notification
      await admin.from("notification_logs").insert({
        user_id: profile.user_id,
        type: "weekly_summary",
        channel: "telegram",
        message_preview: message.slice(0, 100),
        status: "sent",
        sent_at: new Date().toISOString(),
      });

      results.success++;
    } catch (err) {
      console.error(`Cron error for user ${profile.user_id}:`, err);
      results.failed++;
    }
  }

  return NextResponse.json({ weekStart, ...results });
}
