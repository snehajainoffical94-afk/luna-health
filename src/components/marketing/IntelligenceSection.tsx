export default function IntelligenceSection() {
  const biomarkers = [
    { name: "Vitamin D", value: "18 ng/mL", status: "low", note: "Affects bone health, immunity & sleep" },
    { name: "HbA1c", value: "5.4%", status: "normal", note: "Blood sugar control — good" },
    { name: "Ferritin", value: "12 ng/mL", status: "low", note: "Iron stores — may cause fatigue" },
    { name: "TSH", value: "2.1 mIU/L", status: "normal", note: "Thyroid function — optimal" },
    { name: "LDL", value: "142 mg/dL", status: "high", note: "Cardiovascular risk — monitor" },
  ];

  return (
    <section className="py-24 bg-luna-dark overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div>
            <p className="text-luna-purple-light text-sm font-medium uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
              Upload once.<br />
              <span className="gold-text">Understand everything.</span>
            </h2>
            <p className="text-white/50 leading-relaxed mb-8">
              Our AI agent reads your blood panel, cross-references it with your Luna ring&apos;s HRV,
              sleep, and recovery data — then explains exactly what&apos;s happening inside your body
              and what to do about it.
            </p>
            <div className="space-y-4">
              {[
                ["1", "Upload your blood report (PDF or image)"],
                ["2", "AI extracts and structures all biomarkers"],
                ["3", "Luna ring data is pulled automatically"],
                ["4", "Claude generates your weekly health brief"],
                ["5", "Sent to you via Telegram every Monday"],
              ].map(([num, text]) => (
                <div key={num} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-luna-purple/20 text-luna-purple-light text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {num}
                  </span>
                  <p className="text-sm text-white/60">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: mock dashboard card */}
          <div className="relative">
            <div className="glass rounded-2xl p-6 gradient-border">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Blood Panel — Jan 2026</p>
                  <p className="font-semibold text-white mt-0.5">Extracted Biomarkers</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs border border-green-500/20">
                  5 markers found
                </span>
              </div>
              <div className="space-y-3">
                {biomarkers.map((b) => (
                  <div key={b.name} className="flex items-center justify-between p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">{b.name}</p>
                      <p className="text-xs text-white/35">{b.note}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{b.value}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        b.status === "low" ? "bg-blue-400/10 text-blue-400" :
                        b.status === "high" ? "bg-red-400/10 text-red-400" :
                        "bg-green-400/10 text-green-400"
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-luna-purple/10 border border-luna-purple/20">
                <p className="text-xs text-luna-purple-light font-medium mb-1">🤖 AI Insight</p>
                <p className="text-xs text-white/60 leading-relaxed">
                  Low Vitamin D + low Ferritin may explain your fatigue and reduced recovery scores.
                  Consider supplementation and a follow-up in 8 weeks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
