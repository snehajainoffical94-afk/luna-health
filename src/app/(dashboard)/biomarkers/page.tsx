import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { BIOMARKER_META } from "@/lib/ocr/biomarkerParser";
import { AlertTriangle, TrendingDown, TrendingUp, CheckCircle } from "lucide-react";

export default async function BiomarkersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: biomarkers } = await supabase
    .from("biomarkers")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const grouped = (biomarkers ?? []).reduce<Record<string, typeof biomarkers>>((acc, b) => {
    if (!acc[b.marker_name]) acc[b.marker_name] = [];
    acc[b.marker_name]!.push(b);
    return acc;
  }, {});

  const abnormal = (biomarkers ?? []).filter((b) => b.status !== "normal");

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-1">Biomarkers</h1>
        <p className="text-white/40 text-sm">All extracted biomarkers from your uploaded reports.</p>
      </div>

      {/* Alerts */}
      {abnormal.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">{abnormal.length} marker{abnormal.length > 1 ? "s" : ""} outside reference range</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {abnormal.map((b) => (
              <span key={b.id} className={`text-xs px-3 py-1 rounded-full border ${b.status === "low" ? "bg-blue-400/10 text-blue-400 border-blue-400/20" : "bg-red-400/10 text-red-400 border-red-400/20"}`}>
                {b.marker_name} ({b.status})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Biomarker Cards */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <p className="text-lg mb-2">No biomarkers yet</p>
          <p className="text-sm">Upload a blood report to get started</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(grouped).map(([markerName, entries]) => {
            if (!entries) return null;
            const latest = entries[0]!;
            const meta = BIOMARKER_META[markerName];
            const StatusIcon = latest.status === "normal" ? CheckCircle : latest.status === "low" ? TrendingDown : TrendingUp;
            const statusColor = latest.status === "normal" ? "text-green-400" : latest.status === "low" ? "text-blue-400" : "text-red-400";

            return (
              <Card key={markerName} className="hover:border-white/12 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-medium capitalize">{meta?.display_name ?? markerName}</CardTitle>
                    <Badge variant={latest.status as "low" | "normal" | "high"} className="flex-shrink-0">
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {latest.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 mb-2">
                    <span className={`text-3xl font-bold ${statusColor}`}>{latest.value}</span>
                    <span className="text-white/40 text-sm mb-1">{latest.unit}</span>
                  </div>
                  {latest.ref_range_low != null && (
                    <p className="text-xs text-white/30 mb-2">
                      Ref: {latest.ref_range_low} – {latest.ref_range_high} {latest.unit}
                    </p>
                  )}
                  {meta && (
                    <p className="text-xs text-white/40 leading-relaxed">
                      {latest.status !== "normal"
                        ? (latest.status === "low" ? meta.low_implications : meta.high_implications)
                        : meta.description}
                    </p>
                  )}
                  <p className="text-xs text-white/20 mt-3">{formatDate(latest.created_at)}</p>
                  {entries.length > 1 && (
                    <p className="text-xs text-white/30 mt-1">{entries.length} readings tracked</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
