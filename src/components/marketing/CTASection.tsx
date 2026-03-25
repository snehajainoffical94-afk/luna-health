import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 bg-luna-dark-2">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="glass rounded-3xl p-12 gradient-border glow-purple">
          <p className="text-luna-gold text-sm font-medium uppercase tracking-widest mb-4">Get Started Today</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 leading-tight">
            Know your body.<br />
            <span className="gold-text">Own your health.</span>
          </h2>
          <p className="text-white/40 mb-10 text-sm leading-relaxed max-w-md mx-auto">
            Upload your first blood report in under 2 minutes. Your first AI health summary is ready the same day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button variant="gold" size="xl" className="gap-2">
                Create Free Account <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="xl">View Demo Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
