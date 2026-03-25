import Link from "next/link";
import { Activity } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/6 bg-luna-dark-2 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-luna-purple to-luna-gold flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display font-bold">luna health</span>
            </Link>
            <p className="text-xs text-white/40 leading-relaxed">
              AI-powered health intelligence from your blood work and wearable data.
            </p>
          </div>
          {[
            { title: "Product", links: [["Luna Ring", "/products"], ["Features", "/features"], ["Dashboard", "/dashboard"]] },
            { title: "Company", links: [["About", "/about"], ["Privacy", "#"], ["Terms", "#"]] },
            { title: "Support", links: [["Telegram", "#"], ["Help", "#"], ["Contact", "#"]] },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">{col.title}</p>
              <div className="flex flex-col gap-2">
                {col.links.map(([label, href]) => (
                  <Link key={label} href={href} className="text-sm text-white/50 hover:text-white transition-colors">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-white/6 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">© 2026 Luna Health. Demo project.</p>
          <p className="text-xs text-white/20">Built with Claude Code × Antigravity</p>
        </div>
      </div>
    </footer>
  );
}
