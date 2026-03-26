"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED = [
  "What do my latest blood results say about my iron levels?",
  "Based on my HRV and sleep data, am I ready for intense training?",
  "What does my overall health score mean and how can I improve it?",
  "Are there any biomarkers I should be concerned about?",
  "Create a weekly training plan based on my current recovery data.",
];

export default function AiCoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your Luna Health AI Coach. I have access to all your health data — biomarkers, wearable metrics, body composition, and weekly summaries. Ask me anything about your health, training, recovery, or nutrition.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const ask = async (question: string) => {
    if (!question.trim() || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer ?? data.error ?? "Something went wrong." },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] max-h-screen">
      {/* Header */}
      <div className="p-6 border-b border-white/6 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-luna-purple to-luna-gold flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-display font-bold text-white">AI Health Coach</h1>
          <p className="text-xs text-white/40">Powered by Gemini · Your data stays private</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-luna-purple/20 border border-luna-purple/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-luna-purple-light" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-luna-purple/20 border border-luna-purple/30 text-white rounded-tr-sm"
                  : "glass text-white/90 rounded-tl-sm"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4 text-white/60" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-luna-purple/20 border border-luna-purple/30 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-luna-purple-light" />
            </div>
            <div className="glass rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (only on first load) */}
      {messages.length === 1 && (
        <div className="px-6 pb-3 flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="flex-shrink-0 text-xs px-3 py-2 rounded-full border border-white/10 text-white/50 hover:text-white hover:border-luna-purple/40 hover:bg-luna-purple/10 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/6 flex-shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); ask(input); }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your health, training, recovery..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-luna-purple/50 focus:ring-1 focus:ring-luna-purple/30"
            disabled={loading}
          />
          <Button type="submit" variant="gold" size="sm" disabled={loading || !input.trim()} className="px-3">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
