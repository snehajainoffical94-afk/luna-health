import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-luna-dark pt-20">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-display font-bold mb-4">How Luna Health Works</h1>
          <p className="text-white/50 max-w-xl mx-auto">From upload to insight — the full intelligence pipeline.</p>
        </div>
        <div className="space-y-6">
          {[
            { step: "01", title: "Upload Your Blood Report", body: "PDF or image. Any lab format. Our OCR engine reads it automatically." },
            { step: "02", title: "AI Extracts All Biomarkers", body: "50+ biomarkers identified, structured, and checked against reference ranges." },
            { step: "03", title: "Luna Ring Data Synced", body: "HRV, sleep, recovery, steps, SpO2 — all pulled from your ring." },
            { step: "04", title: "Claude AI Generates Your Brief", body: "Cross-references blood work + wearable data. Produces your weekly health intelligence report." },
            { step: "05", title: "Delivered via Telegram + Dashboard", body: "Every Monday, 8am. Full summary with training, recovery, sleep, nutrition, and MSK guidance." },
          ].map(({ step, title, body }) => (
            <div key={step} className="flex gap-6 glass rounded-2xl p-6 hover:-translate-y-1 transition-transform">
              <span className="text-4xl font-display font-bold text-white/10 flex-shrink-0">{step}</span>
              <div>
                <h3 className="text-lg font-bold mb-1">{title}</h3>
                <p className="text-white/50 text-sm">{body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/signup"><Button variant="gold" size="xl">Start Free</Button></Link>
        </div>
      </div>
    </div>
  );
}
