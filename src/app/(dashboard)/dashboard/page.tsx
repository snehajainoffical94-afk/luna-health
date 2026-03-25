import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Upload, ArrowRight, TrendingUp, Heart, Moon, Zap, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, biomarkersRes, wearableRes, summaryRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    supabase.from("biomarkers").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("wearable_metrics").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(1),
    supabase.from("weekly_summaries").select("*").eq("user_id", user.id).order("week_start_date", { ascending: false }).limit(1),
  ]);

  const profile = profileRes.data;
  const biomarkers = biomarkersRes.data ?? [];
  const wearable = wearableRes.data?.[0] ?? null;
  const summary = summaryRes.data?.[0] ?? null;

  const abnormal = biomarkers.filter((b) => b.status !== "normal");

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold mb-1">
            Good morning, {profile?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-white/40 text-sm">Here&apos;s your health overview — {formatDate(new Date())}</p>
        </div>
        <Link href="/upload">
          <Button variant="gold" className="gap-2">
            <Upload className="w-4 h-4" /> Upload Report
          </Button>
        </Link>
      </div>

      {/* Summary Banner */}
      {summary ? (
        <div className="glass rounded-2xl p-6 mb-6 gradient-border glow-purple">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-luna-purple-light font-medium uppercase tracking-wider">Latest Weekly Summary</span>
                <Badge variant="default">Week of {formatDate(summary.week_start_date)}</Badge>
              </div>
              <p className="text-white text-sm leading-relaxed line-clamp-3">{summary.health_summary}</p>
            </div>
            {summary.doctor_consultation_needed && (
              <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400 font-medium">See a doctor</span>
              </div>
            )}
          </div>
          <Link href="/weekly-summary">
            <Button variant="ghost" size="sm" className="mt-4 gap-1 text-luna-purple-light">
              Read full summary <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="glass rounded-2xl p-6 mb-6 text-center border-dashed border-white/10">
          <p className="text-white/40 text-sm mb-3">No weekly summary yet. Upload a blood report to get started.</p>
          <Link href="/upload"><Button variant="gold" size="sm">Upload Your First Report</Button></Link>
        </div>
      )}

      {/* Wearable Quick Stats */}
      {wearable && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Resting HR", value: wearable.resting_hr ? `${wearable.resting_hr} bpm` : "—", icon: Heart, color: "text-red-400", bg: "bg-red-400/10" },
            { label: "HRV", value: wearable.hrv_ms ? `${wearable.hrv_ms} ms` : "—", icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10" },
            { label: "Sleep", value: wearable.sleep_hours ? `${wearable.sleep_hours}h` : "—", icon: Moon, color: "text-blue-400", bg: "bg-blue-400/10" },
            { label: "Recovery", value: wearable.recovery_score ? `${wearable.recovery_score}%` : "—", icon: Zap, color: "text-luna-gold", bg: "bg-luna-gold/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="p-4">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-white/40 mt-0.5">{label}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Biomarkers + Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Biomarkers */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Biomarkers</CardTitle>
              <Link href="/biomarkers">
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-white/40">
                  View all <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {biomarkers.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-4">No biomarkers yet. Upload a report.</p>
            ) : (
              <div className="space-y-3">
                {biomarkers.map((b) => (
                  <div key={b.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{b.marker_name}</p>
                      <p className="text-xs text-white/40">{b.unit}</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-sm font-bold">{b.value}</span>
                      <Badge variant={b.status as "low" | "normal" | "high"} className="capitalize">{b.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { href: "/upload", label: "Upload Blood Report", desc: "PDF or image lab report", icon: Upload, color: "bg-luna-purple/10 text-luna-purple-light" },
              { href: "/wearable", label: "Log Wearable Data", desc: "Sync today's Luna ring data", icon: Heart, color: "bg-luna-gold/10 text-luna-gold" },
              { href: "/anthropometric", label: "Update Body Metrics", desc: "Weight, height, body composition", icon: TrendingUp, color: "bg-green-400/10 text-green-400" },
              { href: "/weekly-summary", label: "Generate Summary", desc: "Get your AI health brief", icon: Zap, color: "bg-blue-400/10 text-blue-400" },
            ].map(({ href, label, desc, icon: Icon, color }) => (
              <Link key={href} href={href}>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white group-hover:text-white">{label}</p>
                    <p className="text-xs text-white/35">{desc}</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-white/50 transition-colors" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Abnormal flags */}
      {abnormal.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Markers needing attention</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {abnormal.map((b) => (
              <span key={b.id} className="text-xs px-2 py-1 rounded-md bg-white/5 text-white/60">
                {b.marker_name} — <span className={b.status === "low" ? "text-blue-400" : "text-red-400"}>{b.status}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
