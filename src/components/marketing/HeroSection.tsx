"use client";
import Link from "next/link";
import { ArrowRight, Activity, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-luna-dark">
      {/* Background effects */}
      <div className="absolute inset-0 bg-luna-radial opacity-60" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-luna-purple/5 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-luna-gold/5 blur-3xl" />

      {/* Animated ring graphic */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden xl:block opacity-20">
        <div className="w-96 h-96 rounded-full border border-luna-purple/30 animate-spin-slow" />
        <div className="absolute inset-8 rounded-full border border-luna-gold/20 animate-spin-slow" style={{ animationDirection: "reverse" }} />
        <div className="absolute inset-16 rounded-full border border-white/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-luna-purple to-luna-gold opacity-40 blur-xl" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-luna-gold/20 bg-luna-gold/5 text-luna-gold text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-luna-gold animate-pulse" />
          AI-Powered Health Intelligence · Powered by Luna Ring
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.05] tracking-tight mb-6">
          Your Health,{" "}
          <span className="gold-text">Decoded</span>
          <br />
          <span className="text-white/50">Every Week.</span>
        </h1>

        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your blood reports. Wear the Luna Ring. Get weekly AI health intelligence
          that explains what your body is telling you — in plain language.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/signup">
            <Button variant="gold" size="xl" className="gap-2">
              Start Your Health Journey <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/features">
            <Button variant="outline" size="xl">
              See How It Works
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { icon: Activity, label: "Biomarkers Tracked", value: "50+" },
            { icon: Zap, label: "AI Insights Weekly", value: "7+" },
            { icon: Shield, label: "Data Security", value: "100%" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Icon className="w-4 h-4 text-luna-gold" />
              </div>
              <div className="text-2xl font-bold gold-text">{value}</div>
              <div className="text-xs text-white/40 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-luna-dark to-transparent" />
    </section>
  );
}
