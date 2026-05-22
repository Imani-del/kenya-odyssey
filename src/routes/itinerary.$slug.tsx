import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Calendar, Wallet, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/itinerary/$slug")({
  component: ItineraryPage,
  head: ({ params }) => ({ meta: [{ title: `${params.slug.replace(/-/g, " ")} — Safari Itinerary` }] }),
});

type Stop = { time: string; title: string; detail?: string };
type Day = { day: number; title: string; stops: Stop[] };

function ItineraryPage() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["itinerary", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("itineraries").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="mx-auto max-w-5xl px-6 pt-20 text-muted-foreground">Loading…</div>;
  if (!data) throw notFound();
  const days = (data.itinerary_content as Day[]) ?? [];

  return (
    <div className="pb-20">
      <div className="relative h-[45vh] min-h-[340px] overflow-hidden">
        <img src={data.hero_image ?? ""} alt={data.title} className="absolute inset-0 h-full w-full object-cover animate-ken-burns" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-x-0 bottom-0 max-w-5xl mx-auto px-6 pb-10">
          <Link to="/plan" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-4">
            <ChevronLeft className="size-4" /> Back to planner
          </Link>
          <h1 className="font-display text-4xl sm:text-5xl text-balance max-w-3xl">{data.title}</h1>
          <p className="mt-3 text-white/80 max-w-2xl">{data.description}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/80">
            {data.duration && <span className="flex items-center gap-1"><Calendar className="size-4" /> {data.duration}</span>}
            {data.budget_range && <span className="flex items-center gap-1"><Wallet className="size-4" /> {data.budget_range}</span>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 mt-10 space-y-8">
        {days.map((d) => (
          <div key={d.day} className="glass rounded-3xl p-6 sm:p-8 shadow-elegant">
            <div className="text-xs uppercase tracking-[0.2em] text-accent">Day {d.day}</div>
            <h2 className="font-display text-2xl sm:text-3xl mt-1">{d.title}</h2>
            <div className="mt-5 relative">
              <div className="absolute left-[22px] top-2 bottom-2 w-px bg-border" />
              <div className="space-y-3">
                {d.stops.map((s, i) => (
                  <div key={i} className="relative flex gap-4">
                    <div className="size-11 shrink-0 rounded-full bg-gradient-sunset grid place-items-center text-xs z-10 shadow-glow font-mono">{s.time}</div>
                    <div className="flex-1 glass-light rounded-2xl p-4">
                      <div className="font-medium flex items-center gap-1.5"><MapPin className="size-3.5 text-primary" /> {s.title}</div>
                      {s.detail && <div className="text-xs text-muted-foreground mt-1">{s.detail}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}