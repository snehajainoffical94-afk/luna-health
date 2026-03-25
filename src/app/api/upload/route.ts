import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const supabaseAdmin = () =>
  createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const overrideUserId = formData.get("userId") as string | null;
    const source = (formData.get("source") as string) || "web";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. PDF, JPG, PNG only." }, { status: 400 });
    }

    // Get user
    let userId = overrideUserId;
    if (!userId) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      userId = user.id;
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split(".").pop() ?? "pdf";
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const admin = supabaseAdmin();
    const { error: storageErr } = await admin.storage
      .from("health-reports")
      .upload(fileName, buffer, { contentType: file.type, upsert: false });

    if (storageErr) throw new Error(`Storage error: ${storageErr.message}`);

    const { data: urlData } = admin.storage.from("health-reports").getPublicUrl(fileName);

    // Save upload record
    const fileType = file.type === "application/pdf" ? "pdf" : "image";
    const { data: uploadRecord, error: dbErr } = await admin
      .from("uploads")
      .insert({
        user_id: userId,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_type: fileType,
        upload_source: source,
        status: "pending",
      })
      .select("id")
      .single();

    if (dbErr) throw new Error(`DB error: ${dbErr.message}`);

    return NextResponse.json({ success: true, uploadId: uploadRecord.id, fileUrl: urlData.publicUrl });
  } catch (err: unknown) {
    console.error("Upload error:", err);
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
