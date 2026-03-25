import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { calculateBMI } from "@/lib/utils";

const supabaseAdmin = () =>
  createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin()
    .from("anthropometric_data")
    .select("*")
    .eq("user_id", user.id)
    .order("measurement_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const admin = supabaseAdmin();

  // Auto-calculate BMI if height and weight provided
  let bmi = body.bmi;
  if (!bmi && body.height_cm && body.weight_kg) {
    bmi = calculateBMI(body.weight_kg, body.height_cm);
  }

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await admin
    .from("anthropometric_data")
    .insert({ ...body, user_id: user.id, bmi, measurement_date: body.measurement_date ?? today })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Also update profile weight/height
  await admin.from("profiles").update({
    height_cm: body.height_cm,
    weight_kg: body.weight_kg,
  }).eq("user_id", user.id);

  return NextResponse.json({ data });
}
