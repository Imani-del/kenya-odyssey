import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign in — Safari Kenya" }, { name: "description", content: "Sign in or create a Safari account." }] }),
});

function AuthPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) nav({ to: "/" }); }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/`, data: { name } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      nav({ to: "/" });
    } catch (e: any) { setErr(e.message ?? "Something went wrong"); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-md px-6 pt-12">
      <div className="glass rounded-3xl p-8 shadow-elegant">
        <h1 className="font-display text-3xl">{mode === "signin" ? "Welcome back" : "Join Safari"}</h1>
        <p className="text-sm text-muted-foreground mt-1">{mode === "signin" ? "Sign in to save trips and post updates." : "Create an account to plan and contribute."}</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary" />
          )}
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary" />
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary" />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button disabled={busy} className="w-full py-3 rounded-xl bg-gradient-sunset text-primary-foreground font-medium shadow-glow disabled:opacity-60">
            {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-4 text-sm text-muted-foreground hover:text-foreground">
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
        <Link to="/" className="block mt-2 text-xs text-muted-foreground hover:text-foreground">← Back to home</Link>
      </div>
    </div>
  );
}