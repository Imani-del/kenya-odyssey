import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Bookmark, Clock, Wallet, Filter, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/explore")({
  component: Explore,
  head: () => ({
    meta: [
      { title: "Explore Hidden Gems — Safari Kenya" },
      { name: "description", content: "Browse Kenya's hidden waterfalls, hikes, cafés, beaches and cultural escapes." },
    ],
  }),
});

const filters = ["All", "Waterfalls", "Hiking", "Cafés", "Road trips", "Beaches", "Camping", "Date spots", "Wildlife", "Culture", "Budget"];

function Explore() {
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["destinations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("destinations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (active !== "All") {
        const cat = it.category?.toLowerCase() ?? "";
        const f = active.toLowerCase().replace(/s$/, "");
        if (!cat.includes(f) && !f.includes(cat)) return false;
      }
      if (query && !it.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [items, active, query]);

  return (
    <div className="mx-auto max-w-7xl px-6 pt-8 pb-20">
      <div className="animate-fade-up">
        <h1 className="font-display text-4xl sm:text-6xl text-balance">
          Find your <span className="italic text-gradient-sunset">next hidden gem</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl">From sea-level salt flats to alpine summits — curated by Kenyan explorers.</p>
      </div>

      <div className="mt-8 glass rounded-2xl p-2 flex items-center gap-2">
        <Search className="size-5 text-muted-foreground ml-2" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search waterfalls, trails, cafés…" className="flex-1 bg-transparent py-3 outline-none" />
        <button className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm flex items-center gap-1.5"><Filter className="size-4" /> Filters</button>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto scrollbar-hide -mx-6 px-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm transition ${active === f ? "bg-gradient-sunset text-primary-foreground shadow-glow" : "glass-light hover:bg-white/10"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-12 text-center text-muted-foreground">Loading destinations…</div>
      ) : filtered.length === 0 ? (
        <div className="mt-12 text-center text-muted-foreground">No destinations match your filters.</div>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 [grid-auto-flow:dense]">
          {filtered.map((it, i) => (
            <Link to="/destination/$slug" params={{ slug: it.slug }} key={it.id} className={`group relative rounded-2xl overflow-hidden shadow-elegant block ${i % 5 === 0 ? "sm:row-span-2 aspect-[4/6]" : "aspect-[4/5]"}`}>
              <img src={it.hero_image ?? ""} alt={it.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-card" />
              <div className="absolute top-3 left-3 right-3 flex justify-between">
                <span className="px-2.5 py-1 rounded-full glass text-[10px] uppercase tracking-wider">{it.category}</span>
                <button className="size-8 rounded-full glass grid place-items-center hover:text-primary"><Bookmark className="size-4" /></button>
              </div>
              <div className="absolute bottom-0 p-5 left-0 right-0">
                <div className="text-xs text-white/70 flex items-center gap-1"><MapPin className="size-3" /> {it.location}</div>
                <h3 className="font-display text-2xl mt-1 leading-tight">{it.title}</h3>
                <div className="mt-2 flex items-center gap-3 text-xs text-white/80">
                  {it.estimated_budget && <span className="flex items-center gap-1"><Wallet className="size-3" /> {it.estimated_budget}</span>}
                  {it.duration && <span className="flex items-center gap-1"><Clock className="size-3" /> {it.duration}</span>}
                  {it.difficulty_level && <span className="px-1.5 py-0.5 rounded bg-white/10">{it.difficulty_level}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}