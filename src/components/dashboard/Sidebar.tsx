"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, LayoutDashboard, Upload, FileText, Dna, Watch, User, Settings, LogOut, BarChart3, Calendar, ChevronRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/upload", icon: Upload, label: "Upload Report" },
  { href: "/reports", icon: FileText, label: "My Reports" },
  { href: "/biomarkers", icon: Dna, label: "Biomarkers" },
  { href: "/wearable", icon: Watch, label: "Wearable Data" },
  { href: "/anthropometric", icon: BarChart3, label: "Body Metrics" },
  { href: "/weekly-summary", icon: Calendar, label: "Weekly Summary" },
  { href: "/ai-coach", icon: Sparkles, label: "AI Coach" },
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <aside className="w-64 min-h-screen bg-luna-dark-2 border-r border-white/6 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-luna-purple to-luna-gold flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-white">luna health</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group",
                active
                  ? "bg-luna-purple/15 text-white border border-luna-purple/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-luna-purple-light" : "text-white/40 group-hover:text-white/70")} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 text-luna-purple/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
