import { FileText, Brain, Bell, Dumbbell, Moon, Stethoscope, Watch, BarChart3 } from "lucide-react";

const features = [
  { icon: FileText, title: "Blood Report OCR", desc: "Upload any PDF or image lab report. Our AI reads it, extracts all biomarkers, and structures them automatically.", color: "text-luna-purple" },
  { icon: Brain, title: "AI Health Agent", desc: "Claude-powered agent reads your blood work + wearable data and generates personalized health intelligence.", color: "text-luna-gold" },
  { icon: Watch, title: "Luna Ring Data", desc: "HRV, sleep score, recovery, resting HR, SpO2 — all pulled from your Luna ring and analyzed together.", color: "text-luna-teal" },
  { icon: BarChart3, title: "Biomarker Tracking", desc: "Track 50+ biomarkers over time. See trends, flag deviations, and understand what's changing.", color: "text-luna-purple" },
  { icon: Dumbbell, title: "Training Guidance", desc: "Know whether to push hard or recover based on your actual biology — not generic advice.", color: "text-luna-gold" },
  { icon: Moon, title: "Sleep & Recovery", desc: "Understand how vitamin D, iron, cortisol, and HRV are affecting your sleep quality and recovery.", color: "text-luna-teal" },
  { icon: Bell, title: "Weekly Telegram Alerts", desc: "Every Monday, get your health summary sent directly to Telegram. No app needed.", color: "text-luna-purple" },
  { icon: Stethoscope, title: "Doctor Flag System", desc: "AI flags when you should consult a doctor and explains why — so you act on time.", color: "text-red-400" },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-luna-dark-2">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-luna-gold text-sm font-medium uppercase tracking-widest mb-3">Capabilities</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Everything your health needs,<br />
            <span className="text-white/40">nothing you don&apos;t.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="glass rounded-2xl p-6 hover:border-white/12 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm">{title}</h3>
              <p className="text-xs text-white/45 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
