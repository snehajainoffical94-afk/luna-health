"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Copy, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/toaster";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [chatId, setChatId] = useState("");
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase.from("profiles").select("telegram_chat_id").eq("user_id", user.id).single();
      if (data?.telegram_chat_id) setChatId(data.telegram_chat_id);
    };
    load();
  }, []);

  const handleSaveTelegram = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ telegram_chat_id: chatId }).eq("user_id", user.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Telegram linked!", description: "You'll receive weekly summaries via Telegram." }); }
    setSaving(false);
  };

  const copyUserId = () => { navigator.clipboard.writeText(userId); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-1">Settings</h1>
        <p className="text-white/40 text-sm">Configure integrations and preferences.</p>
      </div>

      {/* Telegram */}
      <Card className="mb-4 border-luna-purple/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="w-4 h-4 text-luna-purple-light" /> Telegram Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 glass rounded-xl text-sm text-white/60 space-y-2">
            <p className="font-medium text-white/80">Steps to connect:</p>
            <ol className="list-decimal list-inside space-y-1.5 text-white/50">
              <li>Open Telegram and search <strong className="text-white/70">@LunaHealthBot</strong></li>
              <li>Send <code className="bg-white/10 px-1 rounded">/start</code></li>
              <li>Send <code className="bg-white/10 px-1 rounded">/link</code> — bot will show your Chat ID</li>
              <li>Paste that Chat ID below and save</li>
            </ol>
            <a href="https://t.me/LunaHealthBot" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-luna-purple-light hover:text-white mt-2">
              Open Telegram Bot <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-1.5">
            <Label>Your Telegram Chat ID</Label>
            <Input value={chatId} onChange={(e) => setChatId(e.target.value)} placeholder="e.g. 123456789" />
          </div>
          <Button variant="default" onClick={handleSaveTelegram} disabled={saving || !chatId} className="gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Send className="w-4 h-4" /> Link Telegram</>}
          </Button>
        </CardContent>
      </Card>

      {/* Account info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Account Info</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 glass rounded-xl">
            <div>
              <p className="text-xs text-white/40">User ID</p>
              <p className="text-sm text-white/70 font-mono">{userId.slice(0, 20)}...</p>
            </div>
            <button onClick={copyUserId} className="text-white/30 hover:text-white transition-colors">
              {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-white/30">Weekly summaries are sent every Monday at 8:00 AM via Telegram.</p>
        </CardContent>
      </Card>
    </div>
  );
}
