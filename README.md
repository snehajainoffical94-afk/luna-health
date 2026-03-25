# 🌙 Luna Health Intelligence

> AI-powered health intelligence platform for D2C wearable brands. Built as a demo for the Noise Luna smart ring ecosystem.

**Stack:** Next.js 15 · Supabase · Claude AI · Telegram Bot · Tesseract.js · Vercel

---

## What It Does

1. Users upload blood reports (PDF/image) via website or Telegram
2. OCR extracts all biomarkers automatically
3. Luna ring wearable data is combined with blood work
4. Claude AI generates weekly health intelligence summaries
5. Sent via Telegram every Monday + visible on dashboard

---

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/luna-health.git
cd luna-health
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env.local
# Fill in all values (see below)
```

### 3. Supabase Setup
1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste contents of `supabase/migrations/001_initial_schema.sql` → Run
3. Go to **Storage** → create bucket named `health-reports` (set to public)
4. Copy your Project URL and API keys into `.env.local`

### 4. Seed Demo Data
```bash
npm run seed
# Creates demo@lunahealth.app / demo123456
```

### 5. Run Locally
```bash
npm run dev
# Visit http://localhost:3000
```

### 6. Set Up Telegram Bot
1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Create a bot with `/newbot`
3. Add the token to `.env.local` as `TELEGRAM_BOT_TOKEN`
4. After deploying to Vercel, run:
```
GET https://your-app.vercel.app/api/telegram/webhook?setup=1
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `ANTHROPIC_API_KEY` | ✅ | Claude API key |
| `TELEGRAM_BOT_TOKEN` | ✅ | From @BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | ✅ | Any random string |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your deployed URL |
| `CRON_SECRET` | ✅ | Any random string |
| `GOOGLE_SHEETS_ID` | ⬜ | Optional: for MCP export |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | ⬜ | Optional |
| `GOOGLE_PRIVATE_KEY` | ⬜ | Optional |

---

## Deploy to Vercel

1. Push to GitHub
2. Connect repo at [vercel.com](https://vercel.com)
3. Add all env vars in Vercel dashboard
4. Deploy — Vercel auto-detects Next.js
5. Set up Telegram webhook: `GET /api/telegram/webhook?setup=1`

Weekly cron is auto-configured via `vercel.json` (every Monday 8am UTC).

---

## Demo Login
```
Email:    demo@lunahealth.app
Password: demo123456
```

---

## Architecture

```
User → Web/Telegram
  ↓
Next.js API Routes (Vercel)
  ├── /api/upload        → Supabase Storage
  ├── /api/ocr/process   → pdf-parse / tesseract.js → biomarker extraction
  ├── /api/summaries     → Claude AI → weekly_summaries table
  ├── /api/telegram      → grammy webhook
  └── /api/cron          → weekly delivery via Telegram
        ↓
Supabase PostgreSQL (all data)
Google Sheets (MCP export, optional)
```

---

Built with Claude Code × Antigravity
