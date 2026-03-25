import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const features = ["24/7 heart rate monitoring","HRV tracking","Sleep score & staging","SpO2 monitoring","Skin temperature","Readiness/Recovery score","Step & activity tracking","7-day battery","IPX8 water resistance","Premium titanium build"];

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-luna-dark pt-20">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="text-luna-gold text-sm font-medium uppercase tracking-widest">Luna Ring</span>
          <h1 className="text-5xl md:text-6xl font-display font-bold mt-3 mb-6">The Ring That<br /><span className="gold-text">Knows You</span></h1>
          <p className="text-white/50 max-w-xl mx-auto leading-relaxed">A premium smart ring that monitors your health 24/7 — and when combined with our AI platform, turns raw data into actionable intelligence.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {[{ title: "Luna Ring Standard", price: "₹12,999", tag: "Best Value" }, { title: "Luna Ring Pro", price: "₹16,999", tag: "Most Popular", highlight: true }].map((p) => (
            <div key={p.title} className={`glass rounded-2xl p-8 ${p.highlight ? "gradient-border glow-gold" : ""}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{p.title}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-luna-gold/10 text-luna-gold">{p.tag}</span>
              </div>
              <p className="text-4xl font-display font-bold gold-text mb-6">{p.price}</p>
              <div className="space-y-2 mb-8">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" /> {f}
                  </div>
                ))}
              </div>
              <Link href="/signup">
                <Button variant={p.highlight ? "gold" : "outline"} className="w-full gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
