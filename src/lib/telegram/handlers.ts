// =============================================
// LUNA HEALTH — Telegram Bot Handlers
// =============================================

import { Bot, Context } from "grammy";
import { sendTelegramMessage } from "./bot";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export function registerHandlers(bot: Bot): void {
  // /start command
  bot.command("start", async (ctx: Context) => {
    const chatId = ctx.chat?.id;
    const firstName = ctx.from?.first_name ?? "there";
    await ctx.reply(
      `🌙 *Welcome to Luna Health, ${firstName}!*\n\n` +
      `I'm your AI health assistant. Here's what you can do:\n\n` +
      `📋 Send me a PDF or photo of your blood report — I'll extract all biomarkers automatically.\n\n` +
      `📊 /summary — Get your latest weekly health summary\n` +
      `🔗 /link — Link this Telegram to your Luna account\n` +
      `❓ /help — Show all commands\n\n` +
      `_Luna Health Intelligence · Powered by AI_`,
      { parse_mode: "Markdown" }
    );

    // Save chat ID if user already exists and linked
    if (chatId && ctx.from?.username) {
      const supabase = supabaseAdmin();
      await supabase
        .from("profiles")
        .update({ telegram_chat_id: chatId.toString() })
        .eq("telegram_username", ctx.from.username);
    }
  });

  // /link command — associate Telegram with account
  bot.command("link", async (ctx: Context) => {
    const chatId = ctx.chat?.id;
    await ctx.reply(
      `🔗 *Link your Luna account*\n\n` +
      `Go to your Luna Health dashboard → Settings → Telegram Integration\n` +
      `Enter your chat ID: \`${chatId}\`\n\n` +
      `Or visit: ${process.env.NEXT_PUBLIC_APP_URL}/settings`,
      { parse_mode: "Markdown" }
    );
  });

  // /summary command
  bot.command("summary", async (ctx: Context) => {
    const chatId = ctx.chat?.id?.toString();
    if (!chatId) return;

    const supabase = supabaseAdmin();
    // Find user by telegram_chat_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id, name")
      .eq("telegram_chat_id", chatId)
      .single();

    if (!profile) {
      await ctx.reply(
        "⚠️ Your Telegram is not linked to a Luna account yet.\nUse /link to connect your account.",
        { parse_mode: "Markdown" }
      );
      return;
    }

    const { data: summary } = await supabase
      .from("weekly_summaries")
      .select("*")
      .eq("user_id", profile.user_id)
      .order("week_start_date", { ascending: false })
      .limit(1)
      .single();

    if (!summary) {
      await ctx.reply(
        "📋 No weekly summary yet. Upload a blood report on the Luna Health website first!",
        { parse_mode: "Markdown" }
      );
      return;
    }

    const msg = `🌙 *Your Latest Health Summary*\nWeek of ${summary.week_start_date}\n\n${summary.health_summary.slice(0, 800)}...\n\n_View full summary: ${process.env.NEXT_PUBLIC_APP_URL}/weekly-summary_`;
    await ctx.reply(msg, { parse_mode: "Markdown" });
  });

  // /help command
  bot.command("help", async (ctx: Context) => {
    await ctx.reply(
      `🌙 *Luna Health Bot Commands*\n\n` +
      `/start — Welcome & intro\n` +
      `/link — Link to your Luna account\n` +
      `/summary — Get your latest weekly summary\n` +
      `/help — Show this help\n\n` +
      `📋 *Upload Reports:* Just send a PDF or photo — I'll process it automatically.\n\n` +
      `🌐 Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      { parse_mode: "Markdown" }
    );
  });

  // Handle document uploads (PDF)
  bot.on("message:document", async (ctx: Context) => {
    const chatId = ctx.chat?.id?.toString();
    const doc = ctx.message?.document;
    if (!chatId || !doc) return;

    const mimeType = doc.mime_type ?? "";
    if (!["application/pdf", "image/jpeg", "image/png"].includes(mimeType)) {
      await ctx.reply("Please send a PDF or image file of your health report.");
      return;
    }

    await ctx.reply("⏳ Got it! Processing your report...", { parse_mode: "Markdown" });

    try {
      // Get file URL from Telegram
      const file = await ctx.api.getFile(doc.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

      // Download and send to our upload API
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Find user
      const supabase = supabaseAdmin();
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("telegram_chat_id", chatId)
        .single();

      if (!profile) {
        await ctx.reply("⚠️ Link your account first with /link");
        return;
      }

      // Trigger OCR via internal API
      const formData = new FormData();
      formData.append("file", new Blob([buffer], { type: mimeType }), doc.file_name ?? "report.pdf");
      formData.append("userId", profile.user_id);
      formData.append("source", "telegram");

      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      // Trigger OCR
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ocr/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId: data.uploadId, userId: profile.user_id }),
      });

      await ctx.reply(
        `✅ *Report processed successfully!*\n\nYour biomarkers have been extracted and saved.\n\nView them at: ${process.env.NEXT_PUBLIC_APP_URL}/biomarkers`,
        { parse_mode: "Markdown" }
      );
    } catch (err) {
      console.error("Telegram upload error:", err);
      await ctx.reply("❌ Something went wrong processing your report. Please try uploading via the website.");
    }
  });

  // Handle photo uploads
  bot.on("message:photo", async (ctx: Context) => {
    const chatId = ctx.chat?.id?.toString();
    const photos = ctx.message?.photo;
    if (!chatId || !photos || photos.length === 0) return;

    await ctx.reply("📸 Photo received! For best OCR results, please send as a document (File) instead of a compressed photo.");
  });
}
