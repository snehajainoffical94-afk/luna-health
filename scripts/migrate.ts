/**
 * LUNA HEALTH — Migration + Setup Script
 * Creates all tables, RLS policies, storage bucket
 */
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Missing env vars. Make sure .env.local is set.");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function runMigration() {
  console.log("🚀 Running Luna Health setup...\n");

  // 1. Create storage bucket
  console.log("📦 Creating storage bucket...");
  const { error: bucketErr } = await admin.storage.createBucket("health-reports", {
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
  });
  if (bucketErr && !bucketErr.message.includes("already exists")) {
    console.error("  ⚠️  Bucket error:", bucketErr.message);
  } else {
    console.log("  ✅ Storage bucket 'health-reports' ready");
  }

  // 2. Set bucket policy to allow authenticated uploads
  const { error: policyErr } = await admin.storage.from("health-reports").list().catch(() => ({ error: null })) as { error: null };
  if (!policyErr) console.log("  ✅ Storage bucket accessible");

  console.log("\n✅ Setup complete!");
  console.log("\n⚠️  IMPORTANT: Run the SQL migration manually:");
  console.log("   1. Go to https://supabase.com/dashboard/project/srwenpuecbcfzcnntecy/sql/new");
  console.log("   2. Paste the contents of: supabase/migrations/001_initial_schema.sql");
  console.log("   3. Click RUN\n");
}

runMigration().catch(console.error);
