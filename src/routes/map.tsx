import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Mountain, Droplets, Tent, Eye, Download } from "lucide-react";
import hike from "@/assets/card-hike.jpg";

export const Route = createFileRoute("/map")({
  component: TrailMap,
  head: () => ({
    meta: [
      { title: "Trail Map — Safari Kenya" },
      { name: "description", content: "Hiking trails, waterfalls, viewpoints and campsites across Kenya on an interactive map." },
    ],
  }),
});

const pins = [
  { x: 38, y: 32, label: "Mt. Kenya", icon: Mountain, type: "Hike" },
  { x: 28, y: 55, label: "Ngong Hills", icon: Mountain, type: "Hike" },
  { x: 55, y: 42, label: "Thomson's Falls", icon: Droplets, type: "Falls" },
  { x: 70, y: 70, label: "Diani Camp", icon: Tent, type: "Camp" },
  { x: 18, y: 68, label: "Mara Viewpoint", icon: Eye, type: "View" },
  { x: 45, y: 25, label: "Aberdares", icon: Mountain, type: "Hike" },
];

const trails = [
  { name: "Mt. Kenya · Sirimon Route", dist: "32 km", elev: "2,200m", time: "3 days", diff: "Hard" },
  { name: "Ngong Hills Traverse", dist: "13 km", elev: "650m", time: "5 hrs", diff: "Moderate" },
  { name: "Karura Waterfall Loop", dist: "6 km", elev: "120m", time: "2 hrs", diff: "Easy" },
  { name: "Mt. Longonot Crater Rim", dist: "12 km", elev: "850m", time: "5 hrs", diff: "Hard" },
];

function TrailMap() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-8 pb-20">
      <div className="animate-fade-up">
        <h1 className="font-display text-4xl sm:text-6xl text-balance">
          The <span className="italic text-gradient-sunset">trail atlas</span> of Kenya
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl">Every ridge, waterfall, viewpoint and campsite — mapped, rated, and ready to download offline.</p>
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Map mock */}
        <div className="relative rounded-3xl overflow-hidden glass shadow-elegant aspect-[4/3] lg:aspect-auto lg:min-h-[560px]">
          <div className="absolute inset-0 bg-gradient-bush opacity-90" />
          {/* topo lines */}
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 300" preserveAspectRatio="none">
            {Array.from({ length: 14 }).map((_, i) => (
              <path
                key={i}
                d={`M0 ${20 + i * 22} Q 100 ${i * 20 - 10}, 200 ${30 + i * 18} T 400 ${10 + i * 22}`}
                stroke="oklch(0.82 0.09 80)"
                strokeWidth="0.6"
                fill="none"
              />
            ))}
          </svg>
          {/* pins */}
          {pins.map((p) => (
            <button
              key={p.label}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
            >
              <span className="block size-10 rounded-full bg-gradient-sunset shadow-glow grid place-items-center animate-float">
                <p.icon className="size-4 text-primary-foreground" />
              </span>
              <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 rounded-lg glass text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition">
                {p.label}
              </span>
            </button>
          ))}
          <div className="absolute bottom-4 left-4 glass-light rounded-xl px-3 py-2 text-xs flex items-center gap-2">
            <MapPin className="size-3.5 text-primary" /> Mapbox · Kenya
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            {["Hike", "Falls", "Camp", "View"].map((t) => (
              <span key={t} className="glass px-3 py-1.5 rounded-full text-xs">{t}</span>
            ))}
          </div>
        </div>

        {/* Trail list */}
        <div className="space-y-3">
          {trails.map((t, i) => (
            <div key={t.name} className="glass rounded-2xl overflow-hidden shadow-elegant group cursor-pointer">
              {i === 0 && (
                <div className="relative h-32">
                  <img src={hike} alt="Featured trail" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-card" />
                  <div className="absolute bottom-2 left-3 text-xs uppercase tracking-widest text-accent">Featured</div>
                </div>
              )}
              <div className="p-4">
                <div className="font-medium">{t.name}</div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>📏 {t.dist}</span>
                  <span>⛰ {t.elev}</span>
                  <span>⏱ {t.time}</span>
                  <span className={`px-1.5 py-0.5 rounded ${t.diff === "Hard" ? "bg-primary/20 text-primary" : t.diff === "Moderate" ? "bg-accent/20 text-accent" : "bg-secondary/30 text-accent"}`}>{t.diff}</span>
                </div>
              </div>
            </div>
          ))}
          <button className="w-full py-3 rounded-xl glass-light flex items-center justify-center gap-2 text-sm hover:bg-white/10">
            <Download className="size-4" /> Download offline pack
          </button>
        </div>
      </div>
    </div>
  );
}