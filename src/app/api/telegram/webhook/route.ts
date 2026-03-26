import { NextRequest, NextResponse } from "next/server";
import { getBot } from "@/lib/telegram/bot";
import { registerHandlers } from "@/lib/telegram/handlers";
import { webhookCallback } from "grammy";

let handlersRegistered = false;

export async function POST(req: NextRequest) {
  try {
    // Verify secret token
    const secret = req.headers.get("x-telegram-bot-api-secret-token");
    if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bot = getBot();

    if (!handlersRegistered) {
      registerHandlers(bot);
      handlersRegistered = true;
    }

    const handler = webhookCallback(bot, "std/http");
    return handler(req);
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

// GET: setup webhook
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const setup = url.searchParams.get("setup");

  if (setup === "1") {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (!appUrl) return NextResponse.json({ error: "APP_URL not set" }, { status: 500 });

      const { setWebhook } = await import("@/lib/telegram/bot");
      await setWebhook(`${appUrl}/api/telegram/webhook`);
      return NextResponse.json({ success: true, webhook: `${appUrl}/api/telegram/webhook` });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Webhook setup error:", message);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  return NextResponse.json({ status: "Luna Health Telegram Webhook is active" });
}
