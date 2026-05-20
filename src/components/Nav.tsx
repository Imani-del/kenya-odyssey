import { Link } from "@tanstack/react-router";
import { Compass, Map, Sparkles, Users, Menu } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/plan", label: "Plan with AI", icon: Sparkles },
  { to: "/map", label: "Trails", icon: Map },
  { to: "/community", label: "Community", icon: Users },
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <nav className="glass rounded-2xl px-4 sm:px-5 py-3 flex items-center justify-between shadow-elegant">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="h-8 w-8 rounded-xl bg-gradient-sunset grid place-items-center text-primary-foreground font-display font-bold shadow-glow">S</span>
            <span className="font-display text-xl tracking-tight">Safari</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3.5 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors flex items-center gap-1.5"
                activeProps={{ className: "px-3.5 py-2 rounded-xl text-sm text-foreground bg-white/10 flex items-center gap-1.5" }}
              >
                <l.icon className="size-4" />
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm bg-gradient-sunset text-primary-foreground font-medium hover:opacity-90 transition shadow-glow">
              Sign in
            </button>
            <button onClick={() => setOpen(!open)} className="md:hidden h-10 w-10 rounded-xl grid place-items-center bg-white/5 hover:bg-white/10" aria-label="Menu">
              <Menu className="size-5" />
            </button>
          </div>
        </nav>
        {open && (
          <div className="md:hidden glass rounded-2xl mt-2 p-2 animate-fade-up">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/5">
                <l.icon className="size-4 text-primary" />
                <span>{l.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}