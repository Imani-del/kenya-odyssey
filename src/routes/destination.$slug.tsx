import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MapPin, Clock, Wallet, ShieldAlert, CloudRain, Users2, Car, Route as RouteIcon,
  Radio, AlertTriangle, ChevronLeft, Mountain, Calendar, Send,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/destination/$slug")({
  component: DestinationPage,
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Safari Kenya` },
      { name: "description", content: `Live pricing, safety, logistics and community updates.` },
    ],
  }),
});

const STALE_DAYS = 180;

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const d = Math.floor(diff / 86400000);
  if (d >= 30) return `${Math.floor(d / 30)} mo ago`;
  if (d >= 1) return `${d}d ago`;
  const h = Math.floor(diff / 3600000);
  if (h >= 1) return `${h}h ago`;
  return `${Math.max(1, Math.floor(diff / 60000))}m ago`;
}

function DestinationPage() {
  const { slug } = Route.useParams();
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const [msg, setMsg] = useState("");
  const [type, setType] = useState("status");

  const { data: dest, isLoading } = useQuery({
    queryKey: ["destination", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("destinations").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: routes } = useQuery({
    queryKey: ["routes", dest?.id],
    enabled: !!dest?.id,
    queryFn: async () => {
      const { data } = await supabase.from("routes").select("*").eq("destination_id", dest!.id);
      return data ?? [];
    },
  });

  const { data: updates } = useQuery({
    queryKey: ["updates", dest?.id],
    enabled: !!dest?.id,
    queryFn: async () => {
      const { data } = await supabase.from("updates").select("*").eq("destination_id", dest!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (isLoading) return <div className="mx-auto max-w-7xl px-6 pt-20 text-muted-foreground">Loading…</div>;
  if (!dest) throw notFound();

  const stale = Date.now() - new Date(dest.last_updated).getTime() > STALE_DAYS * 86400000;

  const postUpdate = async () => {
    if (!msg.trim() || !user) return;
    const { error } = await supabase.from("updates").insert({
      destination_id: dest.id, update_type: type, update_content: msg.trim(), updated_by: user.id,
    });
    if (!error) { setMsg(""); qc.invalidateQueries({ queryKey: ["updates", dest.id] }); }
  };

  return (
    <div className="pb-20">
      <div className="relative h-[55vh] min-h-[420px] overflow-hidden">
        <img src={dest.hero_image ?? ""} alt={dest.title} className="absolute inset-0 h-full w-full object-cover animate-ken-burns" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-x-0 bottom-0 max-w-7xl mx-auto px-6 pb-10">
          <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-4">
            <ChevronLeft className="size-4" /> Back to explore
          </Link>
          <div className="flex items-center gap-2 text-sm text-accent">
            <MapPin className="size-4" /> {dest.location}
          </div>
          <h1 className="font-display text-4xl sm:text-6xl mt-2 text-balance max-w-3xl">{dest.title}</h1>
          <p className="mt-3 text-white/80 max-w-2xl">{dest.description}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 mt-10">
        {stale && (
          <div className="mb-6 glass-light rounded-xl px-4 py-3 text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="size-4" /> Information may be outdated — last update over 6 months ago.
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-5">
          <Card icon={<Wallet className="size-5" />} title="Pricing">
            <Row label="Budget" value={dest.estimated_budget ?? "—"} />
            <Row label="Entry fee" value={dest.entry_fee ?? "—"} />
            <Row label="Duration" value={dest.duration ?? "—"} />
          </Card>
          <Card icon={<AlertTriangle className="size-5" />} title="Safety & Conditions" accent>
            <Row label="Difficulty" value={dest.difficulty_level ?? "—"} />
            <Row label="Best time" value={dest.best_time_to_visit ?? "—"} />
            <p className="text-sm text-muted-foreground mt-2">{dest.safety_notes}</p>
          </Card>
          <Card icon={<RouteIcon className="size-5" />} title="Access & Logistics">
            <p className="text-sm">{dest.transport_info}</p>
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3" /> Last updated {timeAgo(dest.last_updated)}
            </div>
          </Card>
        </div>

        {dest.gallery_images && dest.gallery_images.length > 0 && (
          <div className="mt-10">
            <h3 className="font-display text-2xl mb-4">Gallery</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dest.gallery_images.map((g: string) => (
                <img key={g} src={g} alt="" className="aspect-[4/3] w-full object-cover rounded-2xl" loading="lazy" />
              ))}
            </div>
          </div>
        )}

        {routes && routes.length > 0 && (
          <div className="mt-10">
            <h3 className="font-display text-2xl mb-4 flex items-center gap-2"><Mountain className="size-5 text-primary" /> Trails & Routes</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {routes.map((r) => (
                <div key={r.id} className="glass rounded-2xl p-5">
                  <div className="flex justify-between items-start gap-3">
                    <h4 className="font-display text-xl">{r.route_name}</h4>
                    <span className="text-xs px-2 py-1 rounded-full glass-light">{r.difficulty}</span>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    {r.distance_km && <span>{r.distance_km} km</span>}
                    {r.estimated_time && <span>{r.estimated_time}</span>}
                    {r.elevation_gain && <span>↑ {r.elevation_gain}m</span>}
                  </div>
                  <p className="mt-2 text-sm">{r.route_description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Radio className="size-3.5" /> Live community updates</div>
              <h3 className="font-display text-2xl sm:text-3xl mt-1">From travelers on the ground</h3>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 sm:p-5 shadow-elegant">
            {user ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <select value={type} onChange={(e) => setType(e.target.value)} className="sm:w-40 bg-white/5 border border-border rounded-xl px-3 py-2 text-sm outline-none">
                  <option value="status">Status</option>
                  <option value="price">Price change</option>
                  <option value="weather">Weather</option>
                  <option value="safety">Safety</option>
                  <option value="route">Route issue</option>
                </select>
                <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Share a quick update from the ground…" className="flex-1 bg-white/5 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
                <button onClick={postUpdate} className="px-4 py-2 rounded-xl bg-gradient-sunset text-primary-foreground text-sm flex items-center gap-1.5 shadow-glow"><Send className="size-3.5" /> Post</button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground"><Link to="/auth" className="text-primary hover:underline">Sign in</Link> to post a ground update.</p>
            )}

            <div className="mt-5 space-y-3">
              {(updates ?? []).map((u) => (
                <div key={u.id} className="flex gap-3 p-3 rounded-xl bg-white/3 border border-border/60">
                  <div className="size-9 rounded-full bg-gradient-sunset grid place-items-center text-xs font-medium">{u.update_type[0].toUpperCase()}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-primary">{u.update_type}</span>
                      <span className="text-xs text-muted-foreground">{timeAgo(u.created_at)}</span>
                    </div>
                    <p className="text-sm mt-1">{u.update_content}</p>
                  </div>
                </div>
              ))}
              {(!updates || updates.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No updates yet. Be the first.</p>
              )}
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-6 text-center">
            <Link to="/admin" className="text-sm text-primary hover:underline">Edit this destination in admin →</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ icon, title, accent, children }: { icon: React.ReactNode; title: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <div className={`glass rounded-2xl p-5 shadow-elegant ${accent ? "ring-1 ring-primary/30" : ""}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="size-9 rounded-xl bg-white/5 grid place-items-center text-primary">{icon}</span>
        <h3 className="font-display text-lg">{title}</h3>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm border-b border-border/40 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}