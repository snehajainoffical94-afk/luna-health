// =============================================
// LUNA HEALTH — Telegram Bot (grammy)
// =============================================

import { Bot, Context } from "grammy";

let botInstance: Bot | null = null;

export function getBot(): Bot {
  if (!botInstance) {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN is not set");
    }
    botInstance = new Bot(process.env.TELEGRAM_BOT_TOKEN);
  }
  return botInstance;
}

export async function sendTelegramMessage(chatId: string | number, text: string): Promise<void> {
  const bot = getBot();
  await bot.api.sendMessage(chatId, text, { parse_mode: "Markdown" });
}

export async function sendTelegramDocument(
  chatId: string | number,
  fileId: string,
  caption?: string
): Promise<void> {
  const bot = getBot();
  await bot.api.sendDocument(chatId, fileId, { caption });
}

export async function setWebhook(url: string): Promise<void> {
  const bot = getBot();
  await bot.api.setWebhook(url, {
    secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
  });
}
