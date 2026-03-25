#!/bin/bash
# LUNA HEALTH — Vercel Deploy + Env Setup Script
# Run this AFTER running the SQL migration in Supabase dashboard

set -e

echo "🚀 Luna Health — Vercel Deployment"
echo "===================================="
echo ""

# Deploy (will open browser for login on first run)
echo "📦 Starting Vercel deployment..."
echo "(A browser window will open for Vercel login — approve it)"
echo ""

vercel --prod \
  --yes \
  --env NEXT_PUBLIC_SUPABASE_URL="https://srwenpuecbcfzcnntecy.supabase.co" \
  --env NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyd2VucHVlY2JjZnpjbm50ZWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjgxMzAsImV4cCI6MjA4OTk0NDEzMH0.LLkZMjkWPI5JU007ZR8UxCGfSA6J7qxJ-6igcF1dZ7U" \
  --env SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyd2VucHVlY2JjZnpjbm50ZWN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM2ODEzMCwiZXhwIjoyMDg5OTQ0MTMwfQ.tHU4jKP_hxPfC4JZRlwdG0p7W9GnGHZbAc9P4nVz1Es" \
  --env GEMINI_API_KEY="AIzaSyBeKSI14iADrkhRO-QNKK-Sd1goP5hMHxY" \
  --env TELEGRAM_BOT_TOKEN="8433362149:AAEeP7Z_DayPjkZKI3eqt4OuI6ureb9A3m8" \
  --env TELEGRAM_WEBHOOK_SECRET="luna-wh-secret-2026-xk9z" \
  --env CRON_SECRET="luna-cron-secret-2026-m3p7" \
  --env GOOGLE_SHEETS_ID="" \
  2>&1 | tee /tmp/vercel-output.txt

# Extract the deployed URL
DEPLOY_URL=$(grep -oP 'https://[a-z0-9\-]+\.vercel\.app' /tmp/vercel-output.txt | head -1)

if [ -z "$DEPLOY_URL" ]; then
  echo ""
  echo "⚠️  Could not auto-detect deploy URL. Check output above."
  echo "    Manually set NEXT_PUBLIC_APP_URL in Vercel dashboard after deployment."
else
  echo ""
  echo "✅ Deployed: $DEPLOY_URL"
  echo ""
  echo "📱 Setting up Telegram webhook..."
  curl -s "$DEPLOY_URL/api/telegram/webhook?setup=1" | python3 -m json.tool 2>/dev/null || echo "(webhook response above)"
  echo ""
  echo "🌐 Update NEXT_PUBLIC_APP_URL in Vercel to: $DEPLOY_URL"
  echo "   Run: vercel env add NEXT_PUBLIC_APP_URL production"
fi

echo ""
echo "===================================="
echo "✅ Deployment complete!"
echo "===================================="
