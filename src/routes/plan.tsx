import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Wallet, Users, MapPin, Calendar, Wand2, Share2, Download, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { generateItinerary, type ItineraryResult } from "@/lib/itinerary.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/plan")({
  component: Plan,
  head: () => ({
    meta: [
      { title: "AI Itinerary Planner — Safari Kenya" },
      { name: "description", content: "Generate a personalized Kenyan itinerary with budget, transport, and hidden stops." },
    ],
  }),
});

const sample = [
  { time: "06:30", title: "Pickup from Westlands", detail: "Uber XL · KES 1,200", icon: "🚐" },
  { time: "08:00", title: "Hike Karura Forest waterfall loop", detail: "Easy · 2h · KES 600 entry", icon: "🌿" },
  { time: "11:00", title: "Brunch at Wasp & Sprout", detail: "Karen · KES 1,800 pp", icon: "🥐" },
  { time: "13:30", title: "Drive to Limuru tea fields", detail: "45 min · scenic route", icon: "🍃" },
  { time: "15:00", title: "Hidden viewpoint at Kentmere", detail: "Photo stop · KES 400", icon: "📸" },
  { time: "18:00", title: "Sunset at Tigoni dam", detail: "Free · bring a blanket", icon: "🌅" },
];

function Plan() {
  const [budget, setBudget] = useState("5000");
  const [people, setPeople] = useState("2");
  const [days, setDays] = useState("1");
  const [vibe, setVibe] = useState("Nature & cafés");
  const [startingFrom, setStartingFrom] = useState("Nairobi");
  const generate = useServerFn(generateItinerary);
  const mutation = useMutation({
    mutationFn: (input: Parameters<typeof generate>[0]["data"]) => generate({ data: input }),
    onError: (e: Error) => toast.error(e.message ?? "Failed to generate itinerary"),
  });
  const result: ItineraryResult | undefined = mutation.data;

  const onGenerate = () => {
    mutation.mutate({
      budget: Number(budget) || 0,
      people: Number(people) || 1,
      days: Number(days) || 1,
      startingFrom: startingFrom || "Nairobi",
      vibe: vibe || "general",
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pt-8 pb-20">
      <div className="animate-fade-up max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass text-xs uppercase tracking-widest text-primary">
          <Sparkles className="size-3" /> AI Planner
        </div>
        <h1 className="mt-4 font-display text-4xl sm:text-6xl text-balance">
          Plan your <span className="italic text-gradient-sunset">perfect day in Kenya</span>
        </h1>
        <p className="mt-3 text-muted-foreground">Tell us a few things. We'll handcraft a route with stops, costs, and weather notes.</p>
      </div>

      <div className="mt-10 grid lg:grid-cols-[380px_1fr] gap-6">
        {/* Form */}
        <div className="glass rounded-3xl p-6 space-y-5 h-fit shadow-elegant">
          <Field icon={<Wallet className="size-4" />} label="Budget (KES)">
            <input value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full bg-transparent outline-none text-lg font-medium" />
          </Field>
          <Field icon={<Users className="size-4" />} label="Travelers">
            <input value={people} onChange={(e) => setPeople(e.target.value)} className="w-full bg-transparent outline-none text-lg font-medium" />
          </Field>
          <Field icon={<Calendar className="size-4" />} label="Duration (days)">
            <input value={days} onChange={(e) => setDays(e.target.value)} className="w-full bg-transparent outline-none text-lg font-medium" />
          </Field>
          <Field icon={<MapPin className="size-4" />} label="Starting from">
            <input value={startingFrom} onChange={(e) => setStartingFrom(e.target.value)} className="w-full bg-transparent outline-none text-lg font-medium" />
          </Field>
          <Field icon={<Sparkles className="size-4" />} label="Vibe">
            <input value={vibe} onChange={(e) => setVibe(e.target.value)} className="w-full bg-transparent outline-none text-lg font-medium" />
          </Field>
          <div className="flex flex-wrap gap-1.5">
            {["Nature", "Cafés", "Hiking", "Date", "Solo", "Wildlife", "Budget"].map((t) => (
              <button key={t} onClick={() => setVibe(t)} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10">{t}</button>
            ))}
          </div>
          <button
            onClick={onGenerate}
            disabled={mutation.isPending}
            className="w-full py-3.5 rounded-xl bg-gradient-sunset text-primary-foreground font-medium shadow-glow flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Wand2 className="size-4" /> {mutation.isPending ? "Generating from real data…" : "Generate itinerary"}
          </button>
        </div>

        {/* Result */}
        <div className="space-y-4">
          <div className="glass rounded-3xl p-6 sm:p-8 shadow-elegant">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-primary">Your itinerary</div>
                <h2 className="font-display text-2xl sm:text-4xl mt-1">
                  {result?.title ?? "Your AI itinerary will appear here"}
                </h2>
                <div className="mt-2 text-sm text-muted-foreground">
                  {people} people · {days} day(s) · target KES {budget}
                </div>
                {result?.overview && (
                  <p className="mt-3 text-sm text-muted-foreground max-w-2xl">{result.overview}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={onGenerate} disabled={mutation.isPending} className="size-9 rounded-xl glass-light grid place-items-center hover:text-primary disabled:opacity-50">
                  <RefreshCw className={`size-4 ${mutation.isPending ? "animate-spin" : ""}`} />
                </button>
                <IconBtn><Share2 className="size-4" /></IconBtn>
                <IconBtn><Download className="size-4" /></IconBtn>
              </div>
            </div>

            {!result && !mutation.isPending && (
              <div className="mt-6 text-sm text-muted-foreground">
                Enter your trip details and hit <span className="text-primary">Generate itinerary</span>. The AI only uses real destinations, routes, and prices from our database — never made-up info.
              </div>
            )}
            {mutation.isPending && (
              <div className="mt-6 text-sm text-muted-foreground animate-pulse">Retrieving destinations and building your day…</div>
            )}
            {result && result.days.length === 0 && (
              <div className="mt-6 text-sm text-muted-foreground">No itinerary could be built from the current data. Try a different vibe or location.</div>
            )}
            {result && result.days.map((day) => (
              <div key={day.day} className="mt-6">
                <div className="text-xs uppercase tracking-widest text-primary mb-2">Day {day.day}{day.summary ? ` · ${day.summary}` : ""}</div>
                <div className="relative">
                  <div className="absolute left-[22px] top-2 bottom-2 w-px bg-border" />
                  <div className="space-y-3">
                    {day.stops.map((s, i) => (
                      <div key={`${day.day}-${i}`} className="relative flex gap-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                        <div className="size-11 shrink-0 rounded-full bg-gradient-sunset grid place-items-center text-lg z-10 shadow-glow">📍</div>
                        <div className="flex-1 glass-light rounded-2xl p-4">
                          <div className="text-xs font-mono text-primary">{s.time}</div>
                          <div className="font-medium mt-0.5">{s.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{s.detail}</div>
                          <div className="flex flex-wrap gap-2 mt-2 text-[10px]">
                            {s.estimated_cost_kes != null && (
                              <span className="px-2 py-0.5 rounded bg-white/5">KES {s.estimated_cost_kes.toLocaleString()}</span>
                            )}
                            {s.destination_slug && (
                              <a href={`/destination/${s.destination_slug}`} className="px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20">View destination</a>
                            )}
                            {s.unknown_fields?.map((u) => (
                              <span key={u} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">{u}: unknown</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {day.estimated_day_cost_kes != null && (
                  <div className="mt-2 text-xs text-muted-foreground">Day total ≈ KES {day.estimated_day_cost_kes.toLocaleString()}</div>
                )}
              </div>
            ))}

            {result && (
              <div className="mt-6 grid sm:grid-cols-2 gap-3 text-xs">
                <div className="glass-light rounded-2xl p-4">
                  <div className="uppercase tracking-widest text-muted-foreground mb-1">Transport notes</div>
                  <div>{result.transport_notes}</div>
                </div>
                <div className="glass-light rounded-2xl p-4">
                  <div className="uppercase tracking-widest text-muted-foreground mb-1">Sources</div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.sources.slice(0, 8).map((s) => (
                      <a key={s.id} href={`/destination/${s.slug}`} className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10">{s.title}</a>
                    ))}
                  </div>
                </div>
                {result.unknown.length > 0 && (
                  <div className="sm:col-span-2 glass-light rounded-2xl p-4">
                    <div className="uppercase tracking-widest text-muted-foreground mb-1">Unknown / missing from our database</div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.unknown.map((u) => (
                        <span key={u} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">{u}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {result && (
            <div className="grid sm:grid-cols-3 gap-4">
              <Stat
                label="Total cost"
                value={result.total_estimated_cost_kes != null ? `KES ${result.total_estimated_cost_kes.toLocaleString()}` : "unknown"}
                sub={result.total_estimated_cost_kes != null && result.total_estimated_cost_kes <= Number(budget) ? "within budget ✓" : "review budget"}
              />
              <Stat label="Days" value={String(result.days.length)} sub={`${result.days.reduce((a, d) => a + d.stops.length, 0)} stops`} />
              <Stat label="Sources" value={String(result.sources.length)} sub="from your database" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/5 px-4 py-3 border border-white/5 focus-within:border-primary/50 transition">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">{icon} {label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
function IconBtn({ children }: { children: React.ReactNode }) {
  return <button className="size-9 rounded-xl glass-light grid place-items-center hover:text-primary">{children}</button>;
}
function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-2xl mt-1">{value}</div>
      <div className="text-xs text-accent mt-1">{sub}</div>
    </div>
  );
}