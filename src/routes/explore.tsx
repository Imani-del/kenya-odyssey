import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Bookmark, Clock, Wallet, Filter, Search } from "lucide-react";
import waterfall from "@/assets/card-waterfall.jpg";
import hike from "@/assets/card-hike.jpg";
import cafe from "@/assets/card-cafe.jpg";
import beach from "@/assets/card-beach.jpg";
import roadtrip from "@/assets/card-roadtrip.jpg";
import culture from "@/assets/card-culture.jpg";
import wildlife from "@/assets/card-wildlife.jpg";
import { useState } from "react";

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

const items = [
  { t: "Sheldrick Falls", l: "Kwale", img: waterfall, b: "KES 1,500", d: "Half day", diff: "Moderate", tag: "Waterfall" },
  { t: "Mt. Longonot Crater Rim", l: "Nakuru", img: hike, b: "KES 2,500", d: "Full day", diff: "Hard", tag: "Hiking" },
  { t: "Wasp & Sprout", l: "Karen", img: cafe, b: "KES 1,800", d: "Brunch", diff: "Easy", tag: "Café" },
  { t: "Watamu Marine Park", l: "Kilifi", img: beach, b: "KES 3,000", d: "Day trip", diff: "Easy", tag: "Beach" },
  { t: "Magadi Salt Lake", l: "Kajiado", img: roadtrip, b: "KES 4,500", d: "Day trip", diff: "Easy", tag: "Road trip" },
  { t: "Maasai Village Stay", l: "Narok", img: culture, b: "KES 6,000", d: "Overnight", diff: "Easy", tag: "Culture" },
  { t: "Amboseli Game Drive", l: "Kajiado", img: wildlife, b: "KES 15,000", d: "2 days", diff: "Easy", tag: "Wildlife" },
  { t: "Karura Hidden Pool", l: "Nairobi", img: waterfall, b: "KES 600", d: "Morning", diff: "Easy", tag: "Hidden gem" },
  { t: "Ngong Hills Sunrise", l: "Kajiado", img: hike, b: "KES 1,200", d: "4 hrs", diff: "Moderate", tag: "Hiking" },
];

function Explore() {
  const [active, setActive] = useState("All");
  return (
    <div className="mx-auto max-w-7xl px-6 pt-8 pb-20">
      <div className="animate-fade-up">
        <h1 className="font-display text-4xl sm:text-6xl text-balance">
          Find your <span className="italic text-gradient-sunset">next hidden gem</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl">From sea-level salt flats to alpine summits — browse over 1,200 places curated by Kenyan explorers.</p>
      </div>

      <div className="mt-8 glass rounded-2xl p-2 flex items-center gap-2">
        <Search className="size-5 text-muted-foreground ml-2" />
        <input placeholder="Search waterfalls, trails, cafés…" className="flex-1 bg-transparent py-3 outline-none" />
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

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 [grid-auto-flow:dense]">
        {items.map((it, i) => (
          <Link to="/explore" key={it.t} className={`group relative rounded-2xl overflow-hidden shadow-elegant block ${i % 5 === 0 ? "sm:row-span-2 aspect-[4/6]" : "aspect-[4/5]"}`}>
            <img src={it.img} alt={it.t} loading="lazy" className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-card" />
            <div className="absolute top-3 left-3 right-3 flex justify-between">
              <span className="px-2.5 py-1 rounded-full glass text-[10px] uppercase tracking-wider">{it.tag}</span>
              <button className="size-8 rounded-full glass grid place-items-center hover:text-primary"><Bookmark className="size-4" /></button>
            </div>
            <div className="absolute bottom-0 p-5 left-0 right-0">
              <div className="text-xs text-white/70 flex items-center gap-1"><MapPin className="size-3" /> {it.l}</div>
              <h3 className="font-display text-2xl mt-1 leading-tight">{it.t}</h3>
              <div className="mt-2 flex items-center gap-3 text-xs text-white/80">
                <span className="flex items-center gap-1"><Wallet className="size-3" /> {it.b}</span>
                <span className="flex items-center gap-1"><Clock className="size-3" /> {it.d}</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10">{it.diff}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}