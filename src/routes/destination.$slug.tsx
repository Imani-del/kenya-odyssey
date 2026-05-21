import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  MapPin, Clock, Wallet, ShieldAlert, CloudRain, Users2, Car, Route as RouteIcon,
  Radio, Camera, Pencil, Save, X, Check, AlertTriangle, ChevronLeft, Mountain,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import waterfall from "@/assets/card-waterfall.jpg";
import hike from "@/assets/card-hike.jpg";
import beach from "@/assets/card-beach.jpg";

export const Route = createFileRoute("/destination/$slug")({
  component: DestinationPage,
  head: ({ params }) => ({
    meta: [
      { title: `${prettifySlug(params.slug)} — Latest Trip Info · Safari Kenya` },
      { name: "description", content: `Live pricing, safety, logistics and community updates for ${prettifySlug(params.slug)}.` },
    ],
  }),
});

function prettifySlug(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type Pricing = {
  entry: string; guide: string; transport: string; parking: string; food: string;
};
type Conditions = {
  trail: "Easy" | "Moderate" | "Difficult";
  weather: "Low" | "Medium" | "High";
  seasonal: string;
  safety: string;
  crowd: "Low" | "Medium" | "High";
};
type Logistics = {
  road: string; transport: string; travelTime: string; entry: string;
};
type Update = {
  id: string; author: string; role: "admin" | "community";
  message: string; ts: number; photo?: string; approved: boolean;
};
type Destination = {
  slug: string; name: string; region: string; image: string; tagline: string;
  pricing: Pricing; pricingUpdated: number;
  conditions: Conditions; conditionsUpdated: number;
  logistics: Logistics;
  updates: Update[];
};

const SEED: Record<string, Destination> = {
  "mt-longonot": {
    slug: "mt-longonot", name: "Mt. Longonot Crater Rim", region: "Nakuru County",
    image: hike,
    tagline: "A volcanic crater hike with 360° Rift Valley views — one of Kenya's most iconic day climbs.",
    pricing: { entry: "300", guide: "1,500 – 3,000", transport: "2,500 – 4,000", parking: "200", food: "500 – 1,200" },
    pricingUpdated: Date.now() - 1000 * 60 * 60 * 24 * 21,
    conditions: { trail: "Difficult", weather: "Medium", seasonal: "Very slippery & foggy April–May and Nov", safety: "Start before 10am. Carry 2L water. Avoid solo hiking.", crowd: "Medium" },
    conditionsUpdated: Date.now() - 1000 * 60 * 60 * 24 * 4,
    logistics: { road: "Tarmac to gate, last 1km is rough but 2WD OK", transport: "Matatu Nairobi → Naivasha, then boda", travelTime: "≈ 1h 45m from Nairobi CBD", entry: "KWS ticket at gate. No advance booking required." },
    updates: [
      { id: "u1", author: "Brian K.", role: "community", message: "Trail marker missing past the second viewpoint — follow the worn ridge to the right.", ts: Date.now() - 1000 * 60 * 60 * 30, approved: true },
      { id: "u2", author: "Safari Admin", role: "admin", message: "Entry fee updated to KES 300 effective Jan 2026.", ts: Date.now() - 1000 * 60 * 60 * 24 * 21, approved: true },
    ],
  },
  "sheldrick-falls": {
    slug: "sheldrick-falls", name: "Sheldrick Falls", region: "Kwale County",
    image: waterfall,
    tagline: "A guided forest descent to a 21m waterfall hidden inside Shimba Hills Reserve.",
    pricing: { entry: "1,500", guide: "1,000", transport: "3,500 – 5,000", parking: "0", food: "600 – 1,000" },
    pricingUpdated: Date.now() - 1000 * 60 * 60 * 24 * 60,
    conditions: { trail: "Moderate", weather: "Low", seasonal: "Best May–Oct. Path muddy after long rains.", safety: "Guides mandatory — elephant territory.", crowd: "Low" },
    conditionsUpdated: Date.now() - 1000 * 60 * 60 * 24 * 12,
    logistics: { road: "Tarmac all the way from Diani (≈45 min)", transport: "Private car or organised tour recommended", travelTime: "≈ 45m from Diani, 1h from Mombasa", entry: "KWS Shimba Hills gate fee + mandatory ranger guide" },
    updates: [
      { id: "u3", author: "Amani W.", role: "community", message: "Pool at the base is swimmable right now — water is crystal clear.", ts: Date.now() - 1000 * 60 * 60 * 50, approved: true },
    ],
  },
  "karura-hidden-pool": {
    slug: "karura-hidden-pool", name: "Karura Hidden Pool", region: "Nairobi",
    image: beach,
    tagline: "A quiet waterfall pool inside Karura Forest — perfect city escape.",
    pricing: { entry: "600", guide: "0", transport: "300 – 800", parking: "200", food: "400 – 900" },
    pricingUpdated: Date.now() - 1000 * 60 * 60 * 24 * 240,
    conditions: { trail: "Easy", weather: "Low", seasonal: "All-year access", safety: "Stay on marked paths.", crowd: "High" },
    conditionsUpdated: Date.now() - 1000 * 60 * 60 * 24 * 8,
    logistics: { road: "Tarmac, Limuru Rd gate", transport: "Uber / Bolt easiest", travelTime: "20–35 min from Nairobi CBD", entry: "Cash or M-Pesa at gate" },
    updates: [],
  },
};

const STALE_DAYS = 180;
const storageKey = (slug: string) => `safari:dest:${slug}`;

function loadDestination(slug: string): Destination | null {
  const seed = SEED[slug];
  if (!seed) return null;
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (raw) return { ...seed, ...JSON.parse(raw) } as Destination;
  } catch {}
  return seed;
}

function saveDestination(d: Destination) {
  try { localStorage.setItem(storageKey(d.slug), JSON.stringify(d)); } catch {}
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (d >= 30) return `${Math.floor(d / 30)} mo ago`;
  if (d >= 1) return `${d}d ago`;
  const h = Math.floor(diff / (1000 * 60 * 60));
  if (h >= 1) return `${h}h ago`;
  const m = Math.max(1, Math.floor(diff / (1000 * 60)));
  return `${m}m ago`;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function DestinationPage() {
  const { slug } = Route.useParams();
  const initial = useMemo(() => loadDestination(slug), [slug]);
  if (!initial) throw notFound();

  const [dest, setDest] = useState<Destination>(initial);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState<null | "pricing" | "conditions" | "logistics">(null);
  const [draft, setDraft] = useState<Destination>(initial);
  const [newUpdate, setNewUpdate] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    setDest(initial); setDraft(initial);
    try { setIsAdmin(localStorage.getItem("safari:admin") === "1"); } catch {}
  }, [initial]);

  const toggleAdmin = () => {
    const next = !isAdmin;
    setIsAdmin(next);
    try { localStorage.setItem("safari:admin", next ? "1" : "0"); } catch {}
    if (!next) setEditing(null);
  };

  const startEdit = (section: "pricing" | "conditions" | "logistics") => {
    setDraft(dest); setEditing(section);
  };

  const commit = () => {
    const now = Date.now();
    const next: Destination = {
      ...draft,
      pricingUpdated: editing === "pricing" ? now : dest.pricingUpdated,
      conditionsUpdated: editing === "conditions" ? now : dest.conditionsUpdated,
    };
    setDest(next); saveDestination(next); setEditing(null);
  };

  const submitUpdate = () => {
    if (!newUpdate.trim()) return;
    const u: Update = {
      id: crypto.randomUUID(), author: author.trim() || (isAdmin ? "Safari Admin" : "Anonymous"),
      role: isAdmin ? "admin" : "community", message: newUpdate.trim(),
      ts: Date.now(), approved: isAdmin,
    };
    const next = { ...dest, updates: [u, ...dest.updates] };
    setDest(next); saveDestination(next); setNewUpdate(""); setAuthor("");
  };

  const moderate = (id: string, approve: boolean) => {
    const next = approve
      ? { ...dest, updates: dest.updates.map((u) => (u.id === id ? { ...u, approved: true } : u)) }
      : { ...dest, updates: dest.updates.filter((u) => u.id !== id) };
    setDest(next); saveDestination(next);
  };

  const pricingStale = Date.now() - dest.pricingUpdated > STALE_DAYS * 86400000;
  const conditionsStale = Date.now() - dest.conditionsUpdated > STALE_DAYS * 86400000;

  return (
    <div className="pb-20">
      {/* Hero */}
      <div className="relative h-[55vh] min-h-[420px] overflow-hidden">
        <img src={dest.image} alt={dest.name} className="absolute inset-0 h-full w-full object-cover animate-ken-burns" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-x-0 bottom-0 max-w-7xl mx-auto px-6 pb-10">
          <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-4">
            <ChevronLeft className="size-4" /> Back to explore
          </Link>
          <div className="flex items-center gap-2 text-sm text-accent">
            <MapPin className="size-4" /> {dest.region}
          </div>
          <h1 className="font-display text-4xl sm:text-6xl mt-2 text-balance max-w-3xl">{dest.name}</h1>
          <p className="mt-3 text-white/80 max-w-2xl">{dest.tagline}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 mt-10">
        {/* Admin toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-accent">Latest Trip Information</div>
            <h2 className="font-display text-3xl sm:text-4xl mt-1">Live updates from the ground</h2>
          </div>
          <button
            onClick={toggleAdmin}
            className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition ${isAdmin ? "bg-gradient-sunset text-primary-foreground shadow-glow" : "glass-light hover:bg-white/10"}`}
          >
            <ShieldAlert className="size-4" />
            {isAdmin ? "Admin mode: ON" : "Enter admin mode"}
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* PRICING */}
          <SectionCard
            icon={<Wallet className="size-5" />}
            title="Updated pricing"
            subtitle={`Last updated: ${formatDate(dest.pricingUpdated)} · ${timeAgo(dest.pricingUpdated)}`}
            stale={pricingStale}
            onEdit={isAdmin && editing !== "pricing" ? () => startEdit("pricing") : undefined}
            editing={editing === "pricing"}
            onCancel={() => setEditing(null)}
            onSave={commit}
          >
            {editing === "pricing" ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {(["entry","guide","transport","parking","food"] as const).map((k) => (
                  <LabeledInput
                    key={k}
                    label={priceLabels[k]}
                    value={draft.pricing[k]}
                    onChange={(v) => setDraft({ ...draft, pricing: { ...draft.pricing, [k]: v } })}
                    prefix="KES"
                  />
                ))}
              </div>
            ) : (
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {(["entry","guide","transport","parking","food"] as const).map((k) => (
                  <div key={k} className="flex justify-between border-b border-border/60 pb-2">
                    <dt className="text-muted-foreground">{priceLabels[k]}</dt>
                    <dd className="font-medium">KES {dest.pricing[k]}</dd>
                  </div>
                ))}
              </dl>
            )}
          </SectionCard>

          {/* SAFETY */}
          <SectionCard
            icon={<AlertTriangle className="size-5" />}
            title="Safety & conditions"
            subtitle={`Updated by ${dest.updates.find((u) => u.role === "admin")?.author ?? "admin"} · ${timeAgo(dest.conditionsUpdated)}`}
            stale={conditionsStale}
            onEdit={isAdmin && editing !== "conditions" ? () => startEdit("conditions") : undefined}
            editing={editing === "conditions"}
            onCancel={() => setEditing(null)}
            onSave={commit}
            accent={dest.conditions.weather === "High" || dest.conditions.trail === "Difficult"}
          >
            {editing === "conditions" ? (
              <div className="space-y-3">
                <SelectRow label="Trail condition" value={draft.conditions.trail} options={["Easy","Moderate","Difficult"]}
                  onChange={(v) => setDraft({ ...draft, conditions: { ...draft.conditions, trail: v as any } })} />
                <SelectRow label="Weather risk" value={draft.conditions.weather} options={["Low","Medium","High"]}
                  onChange={(v) => setDraft({ ...draft, conditions: { ...draft.conditions, weather: v as any } })} />
                <SelectRow label="Crowd level" value={draft.conditions.crowd} options={["Low","Medium","High"]}
                  onChange={(v) => setDraft({ ...draft, conditions: { ...draft.conditions, crowd: v as any } })} />
                <LabeledInput label="Seasonal warning" value={draft.conditions.seasonal}
                  onChange={(v) => setDraft({ ...draft, conditions: { ...draft.conditions, seasonal: v } })} />
                <LabeledInput label="Safety notes" value={draft.conditions.safety}
                  onChange={(v) => setDraft({ ...draft, conditions: { ...draft.conditions, safety: v } })} />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Pill icon={<Mountain className="size-3" />} label={`Trail: ${dest.conditions.trail}`} tone={diffTone(dest.conditions.trail)} />
                  <Pill icon={<CloudRain className="size-3" />} label={`Weather: ${dest.conditions.weather}`} tone={riskTone(dest.conditions.weather)} />
                  <Pill icon={<Users2 className="size-3" />} label={`Crowd: ${dest.conditions.crowd}`} tone="muted" />
                </div>
                <Note label="Seasonal" text={dest.conditions.seasonal} />
                <Note label="Safety" text={dest.conditions.safety} highlight />
              </div>
            )}
          </SectionCard>

          {/* LOGISTICS */}
          <SectionCard
            icon={<RouteIcon className="size-5" />}
            title="Access & logistics"
            subtitle="Getting there & entry requirements"
            onEdit={isAdmin && editing !== "logistics" ? () => startEdit("logistics") : undefined}
            editing={editing === "logistics"}
            onCancel={() => setEditing(null)}
            onSave={commit}
          >
            {editing === "logistics" ? (
              <div className="space-y-3">
                {(["road","transport","travelTime","entry"] as const).map((k) => (
                  <LabeledInput key={k} label={logLabels[k]} value={draft.logistics[k]}
                    onChange={(v) => setDraft({ ...draft, logistics: { ...draft.logistics, [k]: v } })} />
                ))}
              </div>
            ) : (
              <ul className="space-y-3 text-sm">
                <LogiRow icon={<Car className="size-4" />} label="Road" text={dest.logistics.road} />
                <LogiRow icon={<Users2 className="size-4" />} label="Transport" text={dest.logistics.transport} />
                <LogiRow icon={<Clock className="size-4" />} label="Travel time" text={dest.logistics.travelTime} />
                <LogiRow icon={<ShieldAlert className="size-4" />} label="Entry" text={dest.logistics.entry} />
              </ul>
            )}
          </SectionCard>

          {/* MAP LINK */}
          <SectionCard icon={<MapPin className="size-5" />} title="On the map" subtitle="Route overlay reflects latest updates">
            <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-gradient-bush">
              <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 240" preserveAspectRatio="none">
                {Array.from({ length: 10 }).map((_, i) => (
                  <path key={i} d={`M0 ${20 + i * 22} Q 120 ${i * 18 - 10}, 220 ${30 + i * 16} T 400 ${10 + i * 20}`} stroke="oklch(0.82 0.09 80)" strokeWidth="0.6" fill="none" />
                ))}
                <path d="M40 200 Q 140 80, 240 120 T 360 40" stroke="oklch(0.72 0.17 55)" strokeWidth="3" fill="none" strokeDasharray="4 6" />
              </svg>
              {dest.conditions.weather === "High" && (
                <div className="absolute top-3 left-3 right-3 glass-light rounded-lg px-3 py-2 text-xs flex items-center gap-2 text-destructive">
                  <AlertTriangle className="size-3.5" /> Unsafe zone highlighted — high weather risk in effect
                </div>
              )}
              <span className="absolute left-[10%] top-[80%] size-3 rounded-full bg-gradient-sunset shadow-glow" />
              <span className="absolute left-[88%] top-[18%] size-3 rounded-full bg-accent shadow-glow animate-float" />
            </div>
            <Link to="/map" className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
              Open full trail atlas →
            </Link>
          </SectionCard>
        </div>

        {/* COMMUNITY FEED */}
        <div className="mt-10">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Radio className="size-3.5" /> Live community updates</div>
              <h3 className="font-display text-2xl sm:text-3xl mt-1">From travelers on the ground</h3>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 sm:p-5 shadow-elegant">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={author} onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name" className="sm:w-44 bg-white/5 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <input
                value={newUpdate} onChange={(e) => setNewUpdate(e.target.value)}
                placeholder='e.g. "Bridge section flooded after last night\'s rain"'
                className="flex-1 bg-white/5 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button onClick={submitUpdate} disabled={!newUpdate.trim()} className="px-4 py-2 rounded-xl bg-gradient-sunset text-primary-foreground text-sm font-medium disabled:opacity-50 flex items-center gap-1.5">
                <Camera className="size-4" /> Post update
              </button>
            </div>
            {!isAdmin && (
              <p className="text-[11px] text-muted-foreground mt-2">Community updates appear after admin approval.</p>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {dest.updates.length === 0 && (
              <div className="text-sm text-muted-foreground glass-light rounded-xl p-4">No updates yet. Be the first to share.</div>
            )}
            {dest.updates.filter((u) => isAdmin || u.approved).map((u) => (
              <article key={u.id} className={`glass rounded-2xl p-4 flex gap-3 ${!u.approved ? "border-accent/60" : ""}`}>
                <div className={`size-9 rounded-full grid place-items-center text-xs font-semibold shrink-0 ${u.role === "admin" ? "bg-gradient-sunset text-primary-foreground" : "bg-white/10"}`}>
                  {u.author.split(" ").map((s) => s[0]).join("").slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-medium text-foreground">{u.author}</span>
                    <span className={`px-1.5 py-0.5 rounded ${u.role === "admin" ? "bg-primary/20 text-primary" : "bg-white/10 text-muted-foreground"}`}>{u.role}</span>
                    <span className="text-muted-foreground">· {timeAgo(u.ts)}</span>
                    {!u.approved && <span className="text-accent">· pending review</span>}
                  </div>
                  <p className="mt-1 text-sm">{u.message}</p>
                </div>
                {isAdmin && !u.approved && (
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => moderate(u.id, true)} className="size-8 rounded-lg bg-secondary/40 hover:bg-secondary/60 grid place-items-center" aria-label="Approve">
                      <Check className="size-4" />
                    </button>
                    <button onClick={() => moderate(u.id, false)} className="size-8 rounded-lg bg-destructive/30 hover:bg-destructive/50 grid place-items-center" aria-label="Reject">
                      <X className="size-4" />
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const priceLabels = { entry: "Entry fee", guide: "Guide fee", transport: "Transport est.", parking: "Parking", food: "Food & extras" } as const;
const logLabels = { road: "Road condition", transport: "Transport options", travelTime: "Travel time", entry: "Entry requirements" } as const;

function diffTone(v: string) {
  return v === "Difficult" ? "danger" : v === "Moderate" ? "warn" : "ok";
}
function riskTone(v: string) {
  return v === "High" ? "danger" : v === "Medium" ? "warn" : "ok";
}

function SectionCard(props: {
  icon: React.ReactNode; title: string; subtitle?: string; stale?: boolean; accent?: boolean;
  onEdit?: () => void; editing?: boolean; onCancel?: () => void; onSave?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className={`glass rounded-2xl p-5 shadow-elegant ${props.accent ? "ring-1 ring-destructive/40" : ""}`}>
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="flex gap-3">
          <div className="size-10 rounded-xl bg-white/5 grid place-items-center text-primary">{props.icon}</div>
          <div>
            <h3 className="font-display text-xl leading-tight">{props.title}</h3>
            {props.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{props.subtitle}</p>}
            {props.stale && (
              <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full bg-accent/15 text-accent">
                <AlertTriangle className="size-3" /> Information may be outdated — last update over 6 months ago
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-1.5">
          {props.editing ? (
            <>
              <button onClick={props.onCancel} className="size-9 rounded-lg glass-light hover:bg-white/10 grid place-items-center" aria-label="Cancel"><X className="size-4" /></button>
              <button onClick={props.onSave} className="px-3 h-9 rounded-lg bg-gradient-sunset text-primary-foreground text-sm flex items-center gap-1.5"><Save className="size-4" /> Save</button>
            </>
          ) : props.onEdit ? (
            <button onClick={props.onEdit} className="size-9 rounded-lg glass-light hover:bg-white/10 grid place-items-center" aria-label="Edit">
              <Pencil className="size-4" />
            </button>
          ) : null}
        </div>
      </header>
      {props.children}
    </section>
  );
}

function Pill({ icon, label, tone }: { icon: React.ReactNode; label: string; tone: "ok" | "warn" | "danger" | "muted" }) {
  const cls = tone === "danger" ? "bg-destructive/20 text-destructive"
    : tone === "warn" ? "bg-accent/20 text-accent"
    : tone === "ok" ? "bg-secondary/30 text-secondary-foreground"
    : "bg-white/10 text-muted-foreground";
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${cls}`}>{icon}{label}</span>;
}

function Note({ label, text, highlight }: { label: string; text: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3 text-sm ${highlight ? "bg-destructive/10 border border-destructive/30" : "bg-white/5"}`}>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <div>{text}</div>
    </div>
  );
}

function LogiRow({ icon, label, text }: { icon: React.ReactNode; label: string; text: string }) {
  return (
    <li className="flex gap-3">
      <div className="size-8 rounded-lg bg-white/5 grid place-items-center text-primary shrink-0">{icon}</div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-sm">{text}</div>
      </div>
    </li>
  );
}

function LabeledInput({ label, value, onChange, prefix }: { label: string; value: string; onChange: (v: string) => void; prefix?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-center gap-2 bg-white/5 border border-border rounded-xl px-3 py-2 focus-within:border-primary">
        {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
        <input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
      </div>
    </label>
  );
}

function SelectRow({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1 flex gap-1.5">
        {options.map((o) => (
          <button key={o} type="button" onClick={() => onChange(o)}
            className={`px-3 py-1.5 rounded-lg text-xs border ${value === o ? "bg-gradient-sunset text-primary-foreground border-transparent" : "bg-white/5 border-border hover:bg-white/10"}`}>
            {o}
          </button>
        ))}
      </div>
    </label>
  );
}