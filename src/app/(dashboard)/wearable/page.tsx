"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Moon, Zap, Activity, Loader2, Download } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

const MOCK_DATA = {
  resting_hr: 58, max_hr: 142, hrv_ms: 68, sleep_hours: 7.2,
  sleep_score: 78, recovery_score: 82, activity_score: 65, steps: 8420,
  spo2: 98, skin_temp_c: 36.6, stress_score: 32,
};

export default function WearablePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ...MOCK_DATA, date: new Date().toISOString().split("T")[0] });

  const handleChange = (k: string, v: string) => setForm((p) => ({ ...p, [k]: k === "date" ? v : parseFloat(v) || 0 }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wearable", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Wearable data saved!", description: "Today's metrics have been recorded." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleLoadMock = () => { setForm({ ...MOCK_DATA, date: new Date().toISOString().split("T")[0] }); toast({ title: "Demo data loaded", description: "Mock Luna ring data has been filled in." }); };

  const fields = [
    { key: "resting_hr", label: "Resting HR (bpm)", icon: Heart, color: "text-red-400" },
    { key: "hrv_ms", label: "HRV (ms)", icon: Activity, color: "text-green-400" },
    { key: "sleep_hours", label: "Sleep Hours", icon: Moon, color: "text-blue-400" },
    { key: "sleep_score", label: "Sleep Score (0-100)", icon: Moon, color: "text-blue-400" },
    { key: "recovery_score", label: "Recovery Score (0-100)", icon: Zap, color: "text-luna-gold" },
    { key: "activity_score", label: "Activity Score (0-100)", icon: Activity, color: "text-green-400" },
    { key: "steps", label: "Steps", icon: Activity, color: "text-teal-400" },
    { key: "spo2", label: "SpO2 (%)", icon: Heart, color: "text-pink-400" },
    { key: "skin_temp_c", label: "Skin Temp (°C)", icon: Activity, color: "text-orange-400" },
    { key: "stress_score", label: "Stress Score (0-100)", icon: Zap, color: "text-yellow-400" },
  ];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold mb-1">Wearable Data</h1>
          <p className="text-white/40 text-sm">Log your Luna ring metrics manually or load demo data.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLoadMock} className="gap-2">
          <Download className="w-3 h-3" /> Load Demo Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log Today&apos;s Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={form.date} onChange={(e) => handleChange("date", e.target.value)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {fields.map(({ key, label, icon: Icon, color }) => (
              <div key={key} className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Icon className={`w-3 h-3 ${color}`} /> {label}
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form[key as keyof typeof form]}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
          <Button variant="gold" className="w-full gap-2" onClick={handleSave} disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Wearable Data"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
