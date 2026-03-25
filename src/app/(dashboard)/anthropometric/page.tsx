"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toaster";
import { calculateBMI, getBMICategory } from "@/lib/utils";

export default function AnthropometricPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ height_cm: "", weight_kg: "", body_fat_pct: "", waist_cm: "", hip_cm: "" });

  const bmi = form.height_cm && form.weight_kg
    ? calculateBMI(parseFloat(form.weight_kg), parseFloat(form.height_cm))
    : null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v ? parseFloat(v) : null])
      );
      const res = await fetch("/api/anthropometric", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Body metrics saved!", description: "Your measurements have been recorded." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-1">Body Metrics</h1>
        <p className="text-white/40 text-sm">Log your anthropometric measurements for better health context.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Measurements</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "height_cm", label: "Height (cm)" },
              { key: "weight_kg", label: "Weight (kg)" },
              { key: "body_fat_pct", label: "Body Fat (%)" },
              { key: "waist_cm", label: "Waist (cm)" },
              { key: "hip_cm", label: "Hip (cm)" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Input type="number" step="0.1" placeholder="—" value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}

            {bmi && (
              <div className="col-span-2 p-4 glass rounded-xl text-center">
                <p className="text-xs text-white/40 mb-1">Calculated BMI</p>
                <p className="text-3xl font-bold gold-text">{bmi}</p>
                <p className="text-sm text-white/50 mt-1">{getBMICategory(bmi)}</p>
              </div>
            )}
          </div>

          <Button variant="gold" className="w-full" onClick={handleSave} disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Measurements"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
