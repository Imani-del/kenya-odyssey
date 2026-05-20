import { Link } from "@tanstack/react-router";
import { Instagram, Youtube, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl bg-gradient-sunset grid place-items-center font-display font-bold text-primary-foreground">S</span>
            <span className="font-display text-2xl">Safari</span>
          </div>
          <p className="mt-4 text-muted-foreground max-w-sm">
            A premium AI-powered Kenyan travel discovery ecosystem. Find hidden gems, plan smarter, hike deeper.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 text-primary" /> Made in Nairobi, for the world.
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/explore" className="hover:text-foreground">Hidden gems</Link></li>
            <li><Link to="/map" className="hover:text-foreground">Hiking trails</Link></li>
            <li><Link to="/plan" className="hover:text-foreground">AI planner</Link></li>
            <li><Link to="/community" className="hover:text-foreground">Community</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">Follow</h4>
          <div className="mt-4 flex gap-3">
            <a className="h-10 w-10 grid place-items-center rounded-xl glass hover:text-primary" href="#" aria-label="Instagram"><Instagram className="size-4" /></a>
            <a className="h-10 w-10 grid place-items-center rounded-xl glass hover:text-primary" href="#" aria-label="YouTube"><Youtube className="size-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Safari Kenya · Discover beyond the ordinary.
      </div>
    </footer>
  );
}