import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Sparkles, MapPin, Clock, TrendingUp, Bookmark, Mountain, Heart, Play, ArrowRight, Wallet } from "lucide-react";
import heroRift from "@/assets/hero-rift.jpg";
import waterfall from "@/assets/card-waterfall.jpg";
import hike from "@/assets/card-hike.jpg";
import cafe from "@/assets/card-cafe.jpg";
import beach from "@/assets/card-beach.jpg";
import roadtrip from "@/assets/card-roadtrip.jpg";
import culture from "@/assets/card-culture.jpg";
import wildlife from "@/assets/card-wildlife.jpg";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Safari — Discover Kenya Beyond the Ordinary" },
      { name: "description", content: "AI-powered Kenya travel discovery: hidden gems, hiking trails, itineraries, and creator stories." },
    ],
  }),
});

type Card = {
  id: string;
  title: string;
  location: string;
  image: string;
  budget: string;
  duration: string;
  difficulty?: "Easy" | "Moderate" | "Hard";
  tag: string;
};

const trending: Card[] = [
  { id: "1", title: "Karura's Hidden Waterfall", location: "Nairobi", image: waterfall, budget: "KES 500", duration: "Half day", difficulty: "Easy", tag: "Hidden gem" },
  { id: "2", title: "Mt. Kenya Summit at Dawn", location: "Central", image: hike, budget: "KES 18,000", duration: "3 days", difficulty: "Hard", tag: "Hiking" },
  { id: "3", title: "Diani Dhow Sunset", location: "Kwale", image: beach, budget: "KES 2,500", duration: "Evening", difficulty: "Easy", tag: "Coast" },
  { id: "4", title: "Mara Balloon Safari", location: "Narok", image: wildlife, budget: "KES 45,000", duration: "1 day", difficulty: "Easy", tag: "Wildlife" },
];

const categories = [
  { label: "Waterfalls", image: waterfall },
  { label: "Hiking", image: hike },
  { label: "Cafés", image: cafe },
  { label: "Road trips", image: roadtrip },
  { label: "Beaches", image: beach },
  { label: "Wildlife", image: wildlife },
  { label: "Culture", image: culture },
];

const prompts = [
  "Budget date under KES 3,000",
  "Hidden waterfalls near Nairobi",
  "Road trip for 4 friends",
  "Solo hiking adventure",
];

function Home() {
  const [prompt, setPrompt] = useState("");
  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative -mt-20 min-h-[100svh] flex items-end">
        <img
          src={heroRift}
          alt="Cinematic view of the Great Rift Valley at sunset"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative w-full mx-auto max-w-7xl px-6 pb-16 sm:pb-24 pt-32 z-10">
          <div className="max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs uppercase tracking-widest text-accent">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Live in Kenya · 1,240 explorers online
            </div>
            <h1 className="mt-6 font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] text-balance">
              Discover Kenya<br/>
              <span className="italic text-gradient-sunset">beyond the ordinary.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-xl">
              Hidden waterfalls, untouched trails, sunset cafés. Plan your next adventure with AI — or stumble into magic.
            </p>

            {/* AI search */}
            <div className="mt-10 glass rounded-2xl p-2 shadow-elegant">
              <div className="flex items-center gap-2 px-3">
                <Sparkles className="size-5 text-primary shrink-0" />
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What kind of adventure are you looking for?"
                  className="w-full bg-transparent py-3 text-base sm:text-lg outline-none placeholder:text-white/50"
                />
                <Link to="/plan" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-sunset text-primary-foreground font-medium text-sm shadow-glow whitespace-nowrap">
                  Plan trip <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2 px-1.5 pb-1.5">
                {prompts.map((p) => (
                  <button key={p} onClick={() => setPrompt(p)} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition">
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/explore" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl glass-light hover:bg-white/15 font-medium">
                <Search className="size-4" /> Explore hidden gems
              </Link>
              <Link to="/map" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/20 hover:border-white/40 font-medium">
                <Mountain className="size-4" /> Find a trail
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <Section
        kicker="Trending this week"
        title="Where Kenya is going right now"
        cta={{ label: "See all", to: "/explore" }}
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {trending.map((c, i) => (
            <DestinationCard key={c.id} card={c} priority={i === 0} />
          ))}
        </div>
      </Section>

      {/* CATEGORIES */}
      <Section kicker="Browse by mood" title="Pick your kind of magic">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-6 px-6 snap-x">
          {categories.map((c) => (
            <Link
              key={c.label}
              to="/explore"
              className="relative group shrink-0 snap-start h-44 w-36 sm:h-56 sm:w-44 rounded-2xl overflow-hidden shadow-elegant"
            >
              <img src={c.image} alt={c.label} loading="lazy" className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-card" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="font-display text-lg sm:text-xl">{c.label}</div>
                <div className="text-xs text-white/70">Explore →</div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* AI BANNER */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-bush p-8 sm:p-14 shadow-elegant">
          <div className="absolute -top-20 -right-20 size-80 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs uppercase tracking-widest text-accent">
                <Sparkles className="size-3" /> AI Itinerary
              </span>
              <h2 className="mt-4 font-display text-4xl sm:text-5xl leading-tight text-balance">
                Tell us your vibe. <span className="italic text-gradient-sunset">We'll plan the rest.</span>
              </h2>
              <p className="mt-4 text-white/80 max-w-md">
                Budget, crew size, mood — our planner builds a beautiful day-by-day itinerary with routes, costs, and hidden stops.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/plan" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-sunset text-primary-foreground font-medium shadow-glow">
                  Plan with AI <ArrowRight className="size-4" />
                </Link>
                <Link to="/explore" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl glass-light">
                  Browse first
                </Link>
              </div>
            </div>
            <div className="glass rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="size-4 text-primary" /> Generated for you
              </div>
              <div className="text-lg font-medium">"One-day nature trip near Nairobi, KES 5,000"</div>
              <div className="space-y-2">
                {[
                  { time: "07:00", title: "Karura Forest entry + waterfall hike", cost: "KES 600" },
                  { time: "11:30", title: "Brunch at Wasp & Sprout", cost: "KES 1,800" },
                  { time: "14:00", title: "Hidden viewpoint at Limuru", cost: "KES 400" },
                  { time: "18:00", title: "Sunset drive back via Tigoni tea fields", cost: "Fuel" },
                ].map((row) => (
                  <div key={row.time} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <div className="text-xs font-mono text-primary w-12">{row.time}</div>
                    <div className="flex-1 text-sm">{row.title}</div>
                    <div className="text-xs text-muted-foreground">{row.cost}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WEEKEND ESCAPES — magazine */}
      <Section kicker="Weekend escapes" title="Two days, one unforgettable story" cta={{ label: "Map view", to: "/map" }}>
        <div className="grid lg:grid-cols-3 gap-5">
          <FeatureCard image={hike} title="Chyulu Hills under the stars" meta="Kajiado · 2 nights · KES 12k" tag="Hiking" tall />
          <div className="grid gap-5">
            <FeatureCard image={cafe} title="Tigoni café crawl" meta="Kiambu · 1 day · KES 3k" tag="Cafés" />
            <FeatureCard image={roadtrip} title="Magadi salt-lake road trip" meta="Kajiado · 1 day · KES 4k" tag="Road trip" />
          </div>
          <FeatureCard image={culture} title="Sleep in a Maasai manyatta" meta="Narok · 2 nights · KES 9k" tag="Culture" tall />
        </div>
      </Section>

      {/* CREATOR REELS */}
      <Section kicker="From creators" title="Stories from the road" cta={{ label: "Visit community", to: "/community" }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[waterfall, hike, beach, wildlife, culture].map((img, i) => (
            <div key={i} className="relative aspect-[9/14] rounded-2xl overflow-hidden group cursor-pointer">
              <img src={img} alt="Travel reel" loading="lazy" className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-card" />
              <div className="absolute top-3 right-3 size-9 rounded-full glass grid place-items-center">
                <Play className="size-4 fill-white text-white" />
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-full bg-gradient-sunset" />
                  <div className="text-xs">@kenyawander</div>
                </div>
                <div className="mt-1.5 text-sm font-medium line-clamp-2">A hidden pool I shouldn't share</div>
                <div className="mt-1 flex items-center gap-3 text-xs text-white/70">
                  <span className="flex items-center gap-1"><Heart className="size-3" /> 2.1k</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 mt-32 text-center">
        <h2 className="font-display text-4xl sm:text-6xl text-balance">
          Your next trip starts <span className="italic text-gradient-sunset">tonight.</span>
        </h2>
        <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
          Join thousands of Kenyan explorers swapping routes, reels, and well-kept secrets.
        </p>
        <div className="mt-8 flex justify-center gap-3 flex-wrap">
          <Link to="/plan" className="px-6 py-3.5 rounded-xl bg-gradient-sunset text-primary-foreground font-medium shadow-glow">Plan an adventure</Link>
          <Link to="/explore" className="px-6 py-3.5 rounded-xl glass-light">Browse hidden gems</Link>
        </div>
      </section>
    </div>
  );
}

function Section({ kicker, title, cta, children }: { kicker: string; title: string; cta?: { label: string; to: string }; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-6 mt-24">
      <div className="flex items-end justify-between mb-8 gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-primary flex items-center gap-2">
            <TrendingUp className="size-3.5" /> {kicker}
          </div>
          <h2 className="mt-2 font-display text-3xl sm:text-5xl text-balance max-w-2xl">{title}</h2>
        </div>
        {cta && (
          <Link to={cta.to} className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground shrink-0">
            {cta.label} <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function DestinationCard({ card, priority }: { card: Card; priority?: boolean }) {
  return (
    <Link to="/explore" className="group relative rounded-2xl overflow-hidden block shadow-elegant aspect-[4/5]">
      <img
        src={card.image}
        alt={card.title}
        loading={priority ? "eager" : "lazy"}
        className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-card" />
      <div className="absolute top-3 left-3 right-3 flex justify-between">
        <span className="px-2.5 py-1 rounded-full glass text-[10px] uppercase tracking-wider">{card.tag}</span>
        <button className="size-8 rounded-full glass grid place-items-center hover:text-primary" aria-label="Save">
          <Bookmark className="size-4" />
        </button>
      </div>
      <div className="absolute bottom-0 p-4 sm:p-5 left-0 right-0">
        <div className="text-xs text-white/70 flex items-center gap-1"><MapPin className="size-3" /> {card.location}</div>
        <h3 className="font-display text-xl sm:text-2xl mt-1 leading-tight">{card.title}</h3>
        <div className="mt-3 flex items-center gap-3 text-xs text-white/80">
          <span className="flex items-center gap-1"><Wallet className="size-3" /> {card.budget}</span>
          <span className="flex items-center gap-1"><Clock className="size-3" /> {card.duration}</span>
          {card.difficulty && <span className="px-1.5 py-0.5 rounded bg-white/10">{card.difficulty}</span>}
        </div>
      </div>
    </Link>
  );
}

function FeatureCard({ image, title, meta, tag, tall }: { image: string; title: string; meta: string; tag: string; tall?: boolean }) {
  return (
    <div className={`relative rounded-3xl overflow-hidden shadow-elegant group ${tall ? "h-full min-h-[420px] lg:min-h-[560px]" : "h-64"}`}>
      <img src={image} alt={title} loading="lazy" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-card" />
      <div className="absolute top-4 left-4">
        <span className="px-2.5 py-1 rounded-full glass text-[10px] uppercase tracking-wider">{tag}</span>
      </div>
      <div className="absolute bottom-5 left-5 right-5">
        <h3 className="font-display text-2xl sm:text-3xl leading-tight">{title}</h3>
        <div className="mt-2 text-sm text-white/75">{meta}</div>
      </div>
    </div>
  );
}
