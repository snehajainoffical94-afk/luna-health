"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User } from "lucide-react";
import { useToast } from "@/components/ui/toaster";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", age: "", gender: "", activity_level: "", goals: "", medical_history: "" });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (data) setForm({ name: data.name ?? "", age: data.age ?? "", gender: data.gender ?? "", activity_level: data.activity_level ?? "", goals: data.goals ?? "", medical_history: data.medical_history ?? "" });
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from("profiles").update({ ...form, age: form.age ? parseInt(form.age) : null, updated_at: new Date().toISOString() }).eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "Profile saved!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-luna-purple" /></div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-1">Profile</h1>
        <p className="text-white/40 text-sm">Your personal details used to personalise AI health summaries.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4 text-luna-gold" /> Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Full Name</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Arjun Mehta" />
            </div>
            <div className="space-y-1.5">
              <Label>Age</Label>
              <Input type="number" value={form.age} onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))} placeholder="28" />
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-luna-purple/50">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Activity Level</Label>
              <select value={form.activity_level} onChange={(e) => setForm((p) => ({ ...p, activity_level: e.target.value }))}
                className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-luna-purple/50">
                <option value="">Select</option>
                <option value="sedentary">Sedentary</option>
                <option value="light">Light (1-2 days/week)</option>
                <option value="moderate">Moderate (3-4 days/week)</option>
                <option value="active">Active (5-6 days/week)</option>
                <option value="very_active">Very Active (daily)</option>
              </select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Health Goals</Label>
              <Input value={form.goals} onChange={(e) => setForm((p) => ({ ...p, goals: e.target.value }))} placeholder="e.g. Improve energy, run a marathon, lose weight..." />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Medical History (optional)</Label>
              <Input value={form.medical_history} onChange={(e) => setForm((p) => ({ ...p, medical_history: e.target.value }))} placeholder="e.g. Hypothyroidism, Type 2 diabetes..." />
            </div>
          </div>
          <Button variant="gold" className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
