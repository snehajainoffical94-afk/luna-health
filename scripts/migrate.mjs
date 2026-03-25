import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Load .env.local manually
const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = {};
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const idx = trimmed.indexOf("=");
    if (idx > 0) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      env[key] = val;
    }
  }
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

console.log("🔗 Connecting to:", SUPABASE_URL);

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log("\n🚀 Luna Health — Storage Setup\n");

  // Create storage bucket
  const { error } = await admin.storage.createBucket("health-reports", {
    public: true,
    fileSizeLimit: 10485760,
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
  });

  if (error && error.message.toLowerCase().includes("already exists")) {
    console.log("✅ Bucket 'health-reports' already exists — good");
  } else if (error) {
    console.log("⚠️  Bucket error:", error.message);
    console.log("   (You may need to create it manually in Supabase Storage)");
  } else {
    console.log("✅ Storage bucket 'health-reports' created");
  }

  // Test connection
  const { data: test, error: testErr } = await admin.from("profiles").select("count").limit(0);
  if (!testErr) {
    console.log("✅ Database connection working");
  } else if (testErr.message.includes("does not exist")) {
    console.log("⚠️  Tables not found — you need to run the SQL migration first");
    console.log("\n📋 NEXT STEP:");
    console.log("   1. Open: https://supabase.com/dashboard/project/srwenpuecbcfzcnntecy/sql/new");
    console.log("   2. Paste: supabase/migrations/001_initial_schema.sql");
    console.log("   3. Click RUN");
    console.log("   4. Then run: npm run seed");
  } else {
    console.log("⚠️  DB test:", testErr.message);
  }
}

run().catch(console.error);
