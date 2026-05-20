import { createFileRoute } from "@tanstack/react-router";
import { Heart, MessageCircle, Bookmark, Play, Award } from "lucide-react";
import waterfall from "@/assets/card-waterfall.jpg";
import hike from "@/assets/card-hike.jpg";
import cafe from "@/assets/card-cafe.jpg";
import beach from "@/assets/card-beach.jpg";
import roadtrip from "@/assets/card-roadtrip.jpg";
import culture from "@/assets/card-culture.jpg";
import wildlife from "@/assets/card-wildlife.jpg";

export const Route = createFileRoute("/community")({
  component: Community,
  head: () => ({
    meta: [
      { title: "Community — Safari Kenya" },
      { name: "description", content: "Travel reels, reviews, and journals from Kenyan creators and explorers." },
    ],
  }),
});

const posts = [
  { img: waterfall, user: "@kenyawander", title: "A hidden pool I shouldn't share", likes: "2.1k", reel: true },
  { img: hike, user: "@mountainmaina", title: "Summit Mt. Kenya in 48 hours", likes: "4.6k", reel: true },
  { img: cafe, user: "@nairobicrumbs", title: "Best brunch in Karen, ranked", likes: "1.3k" },
  { img: beach, user: "@coastdiaries", title: "Dhow sunset for KES 800", likes: "3.2k", reel: true },
  { img: roadtrip, user: "@magadirun", title: "Road trip to the salt lake", likes: "987" },
  { img: culture, user: "@maasaivisit", title: "A night in a manyatta", likes: "5.1k" },
  { img: wildlife, user: "@maraflyer", title: "Hot-air balloon at dawn", likes: "8.3k", reel: true },
];

function Community() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-8 pb-20">
      <div className="animate-fade-up">
        <h1 className="font-display text-4xl sm:text-6xl text-balance">
          Stories <span className="italic text-gradient-sunset">from the road</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl">Reels, reviews and journals from creators across the country.</p>
      </div>

      {/* Hidden gem of the week */}
      <div className="mt-10 relative rounded-3xl overflow-hidden shadow-elegant min-h-[320px] sm:min-h-[420px] flex items-end">
        <img src={wildlife} alt="Hidden gem of the week" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-card" />
        <div className="relative p-6 sm:p-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass text-xs uppercase tracking-widest text-accent">
            <Award className="size-3.5" /> Hidden gem of the week
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl text-balance">Sleeping under the Mara balloons</h2>
          <p className="mt-3 text-white/80">A creator-shared spot to camp where the balloons launch at dawn. Five minutes of magic for the price of a coffee.</p>
        </div>
      </div>

      <div className="mt-12 columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
        {posts.map((p, i) => (
          <div key={i} className="relative break-inside-avoid rounded-2xl overflow-hidden shadow-elegant group">
            <img src={p.img} alt={p.title} loading="lazy" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-card opacity-90" />
            {p.reel && (
              <div className="absolute top-3 right-3 size-9 rounded-full glass grid place-items-center">
                <Play className="size-4 fill-white text-white" />
              </div>
            )}
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-full bg-gradient-sunset" />
                <div className="text-xs">{p.user}</div>
              </div>
              <div className="mt-2 text-sm font-medium leading-snug">{p.title}</div>
              <div className="mt-2 flex items-center gap-3 text-xs text-white/70">
                <span className="flex items-center gap-1"><Heart className="size-3" /> {p.likes}</span>
                <span className="flex items-center gap-1"><MessageCircle className="size-3" /></span>
                <span className="flex items-center gap-1 ml-auto"><Bookmark className="size-3" /></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}