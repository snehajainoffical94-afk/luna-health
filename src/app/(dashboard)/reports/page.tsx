import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Image, Upload } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: uploads } = await supabase
    .from("uploads")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold mb-1">My Reports</h1>
          <p className="text-white/40 text-sm">All uploaded health documents.</p>
        </div>
        <Link href="/upload"><Button variant="gold" size="sm" className="gap-2"><Upload className="w-3 h-3" /> Upload New</Button></Link>
      </div>

      {!uploads || uploads.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 mb-6">No reports uploaded yet</p>
          <Link href="/upload"><Button variant="gold">Upload First Report</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {uploads.map((u) => (
            <Card key={u.id} className="hover:border-white/12 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${u.file_type === "pdf" ? "bg-luna-purple/10" : "bg-luna-gold/10"}`}>
                  {u.file_type === "pdf" ? <FileText className="w-5 h-5 text-luna-purple-light" /> : <Image className="w-5 h-5 text-luna-gold" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{u.file_name}</p>
                  <p className="text-xs text-white/40">{formatDate(u.created_at)} · via {u.upload_source}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={u.status === "completed" ? "success" : u.status === "failed" ? "destructive" : "outline"}>
                    {u.status}
                  </Badge>
                  <a href={u.file_url} target="_blank" rel="noreferrer" className="text-xs text-white/30 hover:text-white transition-colors">View</a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
