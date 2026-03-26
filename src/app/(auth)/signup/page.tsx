"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error: signupErr } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (signupErr) { setError(signupErr.message); setLoading(false); return; }
    if (data.user) {
      // Create profile
      await supabase.from("profiles").insert({ user_id: data.user.id, name });
      // If session exists, email confirmation is disabled — go straight to dashboard
      if (data.session) {
        router.push("/dashboard");
        return;
      }
      setDone(true);
    }
    setLoading(false);
  };

  if (done) return (
    <div className="min-h-screen bg-luna-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center glass rounded-2xl p-10">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Check your email</h2>
        <p className="text-white/40 text-sm mb-6">We sent a confirmation link to <strong className="text-white">{email}</strong>. Click it to activate your account.</p>
        <Link href="/login"><Button variant="gold" className="w-full">Go to Sign In</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-luna-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-luna-purple to-luna-gold flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold">luna health</span>
          </Link>
          <h1 className="text-2xl font-display font-bold mb-1">Create your account</h1>
          <p className="text-white/40 text-sm">Start your health intelligence journey</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Arjun Mehta" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <Button type="submit" variant="gold" className="w-full" size="lg" disabled={loading}>
              {loading ? "Creating account..." : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
            </Button>
          </form>
          <p className="text-center text-sm text-white/40 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-luna-purple-light hover:text-white transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
