import { Heart, Waves, Thermometer, Battery, Cpu } from "lucide-react";

const specs = [
  { icon: Heart, label: "24/7 Heart Rate & HRV" },
  { icon: Waves, label: "SpO2 & Blood Oxygen" },
  { icon: Thermometer, label: "Skin Temperature" },
  { icon: Battery, label: "7-Day Battery Life" },
  { icon: Cpu, label: "AI Health Processing" },
];

export default function ProductSection() {
  return (
    <section className="py-24 bg-luna-dark-2">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-luna-gold text-sm font-medium uppercase tracking-widest mb-3">The Hardware</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Luna Ring
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            A titanium ring that monitors your body 24/7. Paired with AI, it becomes your personal health intelligence system.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Ring visual */}
          <div className="flex items-center justify-center">
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 rounded-full border-4 border-luna-gold/30 animate-pulse" />
              <div className="absolute inset-4 rounded-full border-2 border-luna-purple/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-luna-dark-3 to-luna-dark-4 border border-white/10 flex items-center justify-center shadow-2xl glow-gold">
                  <div className="w-20 h-20 rounded-full border-4 border-luna-gold/60 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-luna-gold/40" />
                  </div>
                </div>
              </div>
              {/* Orbiting dots */}
              {[0, 72, 144, 216, 288].map((deg, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full bg-luna-gold/60"
                  style={{
                    top: `${50 - 45 * Math.cos((deg * Math.PI) / 180)}%`,
                    left: `${50 + 45 * Math.sin((deg * Math.PI) / 180)}%`,
                    transform: "translate(-50%,-50%)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Specs */}
          <div>
            <h3 className="text-2xl font-display font-bold mb-2">Premium Titanium Build</h3>
            <p className="text-white/40 mb-8 text-sm leading-relaxed">
              Crafted for 24/7 wear. Military-grade sensors with medical-level accuracy. No charging anxiety — 7 days between charges.
            </p>
            <div className="space-y-4">
              {specs.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-4 p-4 glass rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-luna-gold/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-luna-gold" />
                  </div>
                  <span className="text-sm text-white/80">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-4">
              <div className="flex-1 p-4 glass rounded-xl text-center">
                <p className="text-2xl font-bold gold-text">₹12,999</p>
                <p className="text-xs text-white/40 mt-1">Luna Ring Standard</p>
              </div>
              <div className="flex-1 p-4 glass rounded-xl text-center gradient-border">
                <p className="text-2xl font-bold text-white">₹16,999</p>
                <p className="text-xs text-white/40 mt-1">Luna Ring Pro</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
