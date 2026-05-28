import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PlanInput = z.object({
  budget: z.number().min(0).max(10_000_000),
  people: z.number().min(1).max(50),
  days: z.number().min(1).max(30),
  startingFrom: z.string().min(1).max(120),
  vibe: z.string().min(1).max(200),
  categories: z.array(z.string().max(60)).max(20).optional(),
});

export type ItineraryStop = {
  time: string;
  title: string;
  detail: string;
  destination_slug?: string | null;
  estimated_cost_kes?: number | null;
  unknown_fields?: string[];
};

export type ItineraryDay = {
  day: number;
  summary: string;
  stops: ItineraryStop[];
  estimated_day_cost_kes?: number | null;
};

export type ItineraryResult = {
  title: string;
  overview: string;
  days: ItineraryDay[];
  total_estimated_cost_kes?: number | null;
  transport_notes: string;
  unknown: string[];
  sources: { id: string; title: string; slug: string }[];
};

function parseBudgetToKes(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const m = raw.replace(/[, ]/g, "").match(/(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
}

export const generateItinerary = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlanInput.parse(input))
  .handler(async ({ data }): Promise<ItineraryResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    // 1) Retrieve candidate destinations from Supabase
    const { data: destinations, error: destErr } = await supabaseAdmin
      .from("destinations")
      .select(
        "id, title, slug, category, location, description, estimated_budget, difficulty_level, duration, best_time_to_visit, safety_notes, transport_info, entry_fee, latitude, longitude"
      )
      .limit(200);
    if (destErr) throw new Error(destErr.message);

    const vibeTokens = `${data.vibe} ${(data.categories ?? []).join(" ")}`
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 2);

    const perPersonBudgetPerDay = data.budget / Math.max(1, data.people) / Math.max(1, data.days);

    const scored = (destinations ?? [])
      .map((d) => {
        const hay = `${d.title} ${d.category ?? ""} ${d.location ?? ""} ${d.description ?? ""}`.toLowerCase();
        let score = 0;
        for (const t of vibeTokens) if (hay.includes(t)) score += 2;
        if (data.startingFrom && hay.includes(data.startingFrom.toLowerCase())) score += 1;
        const cost = parseBudgetToKes(d.estimated_budget);
        if (cost !== null && cost <= perPersonBudgetPerDay * 1.5) score += 1;
        return { d, score, cost };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 16)
      .map((s) => s.d);

    const ids = scored.map((d) => d.id);
    const { data: routes } = ids.length
      ? await supabaseAdmin
          .from("routes")
          .select("id, destination_id, route_name, difficulty, distance_km, estimated_time, elevation_gain, route_description")
          .in("destination_id", ids)
      : { data: [] as any[] };

    const { data: updates } = ids.length
      ? await supabaseAdmin
          .from("updates")
          .select("destination_id, update_type, update_content, created_at")
          .in("destination_id", ids)
          .order("created_at", { ascending: false })
          .limit(40)
      : { data: [] as any[] };

    // 2) Build a compact, structured context for the model
    const context = {
      query: {
        budget_kes: data.budget,
        travelers: data.people,
        days: data.days,
        starting_from: data.startingFrom,
        vibe: data.vibe,
      },
      destinations: scored.map((d) => ({
        id: d.id,
        slug: d.slug,
        title: d.title,
        category: d.category,
        location: d.location,
        description: d.description,
        estimated_budget: d.estimated_budget,
        difficulty_level: d.difficulty_level,
        duration: d.duration,
        best_time_to_visit: d.best_time_to_visit,
        safety_notes: d.safety_notes,
        transport_info: d.transport_info,
        entry_fee: d.entry_fee,
      })),
      routes: (routes ?? []).map((r) => ({
        destination_id: r.destination_id,
        name: r.route_name,
        difficulty: r.difficulty,
        distance_km: r.distance_km,
        estimated_time: r.estimated_time,
        elevation_gain: r.elevation_gain,
        description: r.route_description,
      })),
      updates: (updates ?? []).map((u) => ({
        destination_id: u.destination_id,
        type: u.update_type,
        content: u.update_content,
      })),
    };

    if (context.destinations.length === 0) {
      return {
        title: "No matching destinations available",
        overview:
          "We don't have any destinations in our database that match this query yet. Add destinations in the admin dashboard, then try again.",
        days: [],
        total_estimated_cost_kes: null,
        transport_notes: "unknown",
        unknown: ["destinations", "routes", "transport", "prices"],
        sources: [],
      };
    }

    // 3) Call the AI gateway with strict RAG instructions
    const systemPrompt = `You are a Kenyan travel itinerary planner.
You MUST ONLY use facts present in the provided JSON context (destinations, routes, updates).
Do NOT use outside knowledge, do NOT invent destinations, prices, distances, routes, or transport.
If a piece of information is not in the context, set it to the string "unknown" and add the field name to the top-level "unknown" array.
Respect the user's budget, number of travelers, number of days, and starting point.
Prefer destinations matching the vibe. Include hiking routes when available in the routes data. Include transport suggestions only if present in destination.transport_info or updates.
Always reference destination slugs from the context as destination_slug.
Return STRICT JSON only — no markdown, no commentary.`;

    const userPrompt = `User query and retrieved context:\n${JSON.stringify(context)}\n\nReturn JSON with this exact shape:\n{
  "title": string,
  "overview": string,
  "days": [{
    "day": number,
    "summary": string,
    "stops": [{
      "time": "HH:MM",
      "title": string,
      "detail": string,
      "destination_slug": string | null,
      "estimated_cost_kes": number | null,
      "unknown_fields": string[]
    }],
    "estimated_day_cost_kes": number | null
  }],
  "total_estimated_cost_kes": number | null,
  "transport_notes": string,
  "unknown": string[]
}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("AI rate limit reached — please try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted — add credits to continue.");
      throw new Error(`AI gateway error (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("AI returned malformed JSON");
    }

    return {
      title: parsed.title ?? "Your Kenyan itinerary",
      overview: parsed.overview ?? "",
      days: Array.isArray(parsed.days) ? parsed.days : [],
      total_estimated_cost_kes: parsed.total_estimated_cost_kes ?? null,
      transport_notes: parsed.transport_notes ?? "unknown",
      unknown: Array.isArray(parsed.unknown) ? parsed.unknown : [],
      sources: scored.map((d) => ({ id: d.id, title: d.title, slug: d.slug })),
    };
  });