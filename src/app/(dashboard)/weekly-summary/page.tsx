"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, Dumbbell, Moon, Salad, AlertTriangle, Heart, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";

interface Summary {
  id: string;
  week_start_date: string;
  overall_score: number;
  health_summary: string;
  training_guidance: string;
  recovery_guidance: string;
  sleep_guidance: string;
  nutrition_guidance: string;
  msk_implications: string;
  doctor_consultation_needed: boolean;
  doctor_reason: string | null;
  prev_week_comparison: string | null;
}

const sections = [
  { key: "health_summary", label: "Health Summary", icon: Heart, color: "text-luna-purple-light" },
  { key: "training_guidance", label: "Training Guidance", icon: Dumbbell, color: "text-luna-gold" },
  { key: "recovery_guidance", label: "Recovery", icon: Zap, color: "text-green-400" },
  { key: "sleep_guidance", label: "Sleep", icon: Moon, color: "text-blue-400" },
  { key: "nutrition_guidance", label: "Nutrition", icon: Salad, color: "text-teal-400" },
  { key: "msk_implications", label: "MSK & Physical Health", icon: ArrowRight, color: "text-orange-400" },
];

export default function WeeklySummaryPage() {
  const { toast } = useToast();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch("/api/summaries/generate", { method: "GET" }).catch(() => {});
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/biomarkers?limit=1"); // just to check auth
      if (res.status === 401) { window.location.href = "/login"; return; }

      // Fetch latest summary directly
      const r = await fetch("/api/summaries/latest");
      if (r.ok) { const d = await r.json(); setSummary(d.data); }
    } catch {}
    setLoading(false);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/summaries/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Summary generated!", description: "Your weekly health brief is ready." });
      await loadSummary();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
    setGenerating(false);
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-luna-purple" />
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold mb-1">Weekly Summary</h1>
          <p className="text-white/40 text-sm">AI-generated health intelligence based on your data.</p>
        </div>
        <Button variant="gold" onClick={handleGenerate} disabled={generating} className="gap-2">
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Zap className="w-4 h-4" /> Generate Now</>}
        </Button>
      </div>

      {!summary ? (
        <div className="text-center py-20 glass rounded-2xl">
          <Zap className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 mb-2">No summary yet</p>
          <p className="text-sm text-white/30 mb-6">Upload a blood report, then generate your first AI health brief.</p>
          <Button variant="gold" onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating..." : "Generate My First Summary"}
          </Button>
        </div>
      ) : (
        <>
          {/* Score header */}
          <div className="glass rounded-2xl p-6 mb-6 gradient-border text-center">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Week of {formatDate(summary.week_start_date)}</p>
            <div className="text-6xl font-display font-bold gold-text mb-2">{summary.overall_score}</div>
            <p className="text-white/50 text-sm">Overall Health Score</p>
            {summary.prev_week_comparison && (
              <p className="text-xs text-white/40 mt-3 italic">{summary.prev_week_comparison}</p>
            )}
          </div>

          {/* Doctor flag */}
          {summary.doctor_consultation_needed && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400 mb-1">Doctor Consultation Recommended</p>
                <p className="text-xs text-white/50">{summary.doctor_reason}</p>
              </div>
            </div>
          )}

          {/* Sections */}
          <div className="space-y-4">
            {sections.map(({ key, label, icon: Icon, color }) => (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className={`w-4 h-4 ${color}`} />
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
                    {summary[key as keyof Summary] as string}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
