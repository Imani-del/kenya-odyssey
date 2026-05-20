import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Wallet, Users, MapPin, Calendar, Wand2, Share2, Download, RefreshCw } from "lucide-react";
import { useState } from "react";

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
  const [generated, setGenerated] = useState(false);

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
            <input defaultValue="Nairobi" className="w-full bg-transparent outline-none text-lg font-medium" />
          </Field>
          <Field icon={<Sparkles className="size-4" />} label="Vibe">
            <input value={vibe} onChange={(e) => setVibe(e.target.value)} className="w-full bg-transparent outline-none text-lg font-medium" />
          </Field>
          <div className="flex flex-wrap gap-1.5">
            {["Nature", "Cafés", "Hiking", "Date", "Solo", "Wildlife", "Budget"].map((t) => (
              <button key={t} onClick={() => setVibe(t)} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10">{t}</button>
            ))}
          </div>
          <button onClick={() => setGenerated(true)} className="w-full py-3.5 rounded-xl bg-gradient-sunset text-primary-foreground font-medium shadow-glow flex items-center justify-center gap-2">
            <Wand2 className="size-4" /> Generate itinerary
          </button>
        </div>

        {/* Result */}
        <div className="space-y-4">
          <div className="glass rounded-3xl p-6 sm:p-8 shadow-elegant">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-primary">Your itinerary</div>
                <h2 className="font-display text-2xl sm:text-4xl mt-1">A nature & café day near Nairobi</h2>
                <div className="mt-2 text-sm text-muted-foreground">{people} people · {days} day · target KES {budget}</div>
              </div>
              <div className="flex gap-2">
                <IconBtn><RefreshCw className="size-4" /></IconBtn>
                <IconBtn><Share2 className="size-4" /></IconBtn>
                <IconBtn><Download className="size-4" /></IconBtn>
              </div>
            </div>

            <div className="mt-6 relative">
              <div className="absolute left-[22px] top-2 bottom-2 w-px bg-border" />
              <div className="space-y-3">
                {sample.map((s, i) => (
                  <div key={s.time} className="relative flex gap-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="size-11 shrink-0 rounded-full bg-gradient-sunset grid place-items-center text-lg z-10 shadow-glow">{s.icon}</div>
                    <div className="flex-1 glass-light rounded-2xl p-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-mono text-primary">{s.time}</div>
                        <div className="font-medium mt-0.5">{s.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{s.detail}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Stat label="Total cost" value="KES 4,200" sub="under budget ✓" />
            <Stat label="Distance" value="78 km" sub="loop · sealed road" />
            <Stat label="Weather" value="22°C ☀" sub="light breeze · low rain" />
          </div>

          {!generated && (
            <p className="text-center text-xs text-muted-foreground">Preview shown · hit generate to personalize</p>
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