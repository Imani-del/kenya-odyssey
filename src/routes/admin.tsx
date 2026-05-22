import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Plus, Trash2, Pencil, Save, X, Upload, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — Safari Kenya" }] }),
});

type Dest = {
  id?: string; title: string; slug: string; category: string; location: string;
  description: string; hero_image: string; gallery_images: string[];
  estimated_budget: string; difficulty_level: string; duration: string;
  latitude: number | null; longitude: number | null;
  best_time_to_visit: string; safety_notes: string; transport_info: string; entry_fee: string; featured: boolean;
};

const empty: Dest = {
  title: "", slug: "", category: "Hiking", location: "", description: "", hero_image: "", gallery_images: [],
  estimated_budget: "", difficulty_level: "Easy", duration: "", latitude: null, longitude: null,
  best_time_to_visit: "", safety_notes: "", transport_info: "", entry_fee: "", featured: false,
};

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"destinations" | "itineraries" | "routes">("destinations");

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  if (loading) return <div className="mx-auto max-w-7xl px-6 pt-12 text-muted-foreground">Loading…</div>;
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-6 pt-12">
        <div className="glass rounded-3xl p-8 text-center">
          <h1 className="font-display text-3xl">Admin access required</h1>
          <p className="mt-3 text-muted-foreground text-sm">Your account ({user.email}) doesn't have admin permissions yet.</p>
          <div className="mt-6 text-left text-xs glass-light rounded-xl p-4 font-mono break-all">
            <p className="text-muted-foreground mb-1">Grant yourself admin from Lovable Cloud → SQL:</p>
            insert into public.user_roles (user_id, role) values ('{user.id}', 'admin');
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pt-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-accent">Admin</div>
          <h1 className="font-display text-4xl">Content dashboard</h1>
        </div>
      </div>
      <div className="mt-6 flex gap-2 border-b border-border">
        {(["destinations","itineraries","routes"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm capitalize ${tab === t ? "border-b-2 border-primary text-foreground" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>
      {tab === "destinations" && <DestinationsTab qc={qc} />}
      {tab === "itineraries" && <ItinerariesTab qc={qc} />}
      {tab === "routes" && <RoutesTab qc={qc} />}
    </div>
  );
}

function DestinationsTab({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-destinations"],
    queryFn: async () => (await supabase.from("destinations").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const [editing, setEditing] = useState<Dest | null>(null);

  const save = async () => {
    if (!editing) return;
    const payload = { ...editing, last_updated: new Date().toISOString() };
    const op = editing.id
      ? supabase.from("destinations").update(payload).eq("id", editing.id)
      : supabase.from("destinations").insert(payload);
    const { error } = await op;
    if (error) { alert(error.message); return; }
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-destinations"] });
    qc.invalidateQueries({ queryKey: ["destinations"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this destination?")) return;
    await supabase.from("destinations").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-destinations"] });
    qc.invalidateQueries({ queryKey: ["destinations"] });
  };

  const uploadImage = async (file: File, bucket: "destination-images" | "gallery-images") => {
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) { alert(error.message); return null; }
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  };

  return (
    <div className="mt-6">
      <div className="flex justify-end mb-4">
        <button onClick={() => setEditing(empty)} className="px-4 py-2 rounded-xl bg-gradient-sunset text-primary-foreground text-sm shadow-glow flex items-center gap-1.5">
          <Plus className="size-4" /> New destination
        </button>
      </div>

      {editing && (
        <div className="glass rounded-3xl p-6 mb-6 space-y-4 shadow-elegant">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-xl">{editing.id ? "Edit" : "New"} destination</h3>
            <div className="flex gap-2">
              <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-lg glass-light text-sm flex items-center gap-1"><X className="size-3.5" /> Cancel</button>
              <button onClick={save} className="px-3 py-1.5 rounded-lg bg-gradient-sunset text-primary-foreground text-sm flex items-center gap-1"><Save className="size-3.5" /> Save</button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Title"><input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })} className={inputCls} /></Field>
            <Field label="Slug"><input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className={inputCls} /></Field>
            <Field label="Category"><input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className={inputCls} /></Field>
            <Field label="Location / County"><input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} className={inputCls} /></Field>
            <Field label="Budget"><input value={editing.estimated_budget} onChange={(e) => setEditing({ ...editing, estimated_budget: e.target.value })} className={inputCls} /></Field>
            <Field label="Difficulty">
              <select value={editing.difficulty_level} onChange={(e) => setEditing({ ...editing, difficulty_level: e.target.value })} className={inputCls}>
                {["Easy","Moderate","Hard"].map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Duration"><input value={editing.duration} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} className={inputCls} /></Field>
            <Field label="Entry fee"><input value={editing.entry_fee} onChange={(e) => setEditing({ ...editing, entry_fee: e.target.value })} className={inputCls} /></Field>
            <Field label="Latitude"><input type="number" step="any" value={editing.latitude ?? ""} onChange={(e) => setEditing({ ...editing, latitude: e.target.value ? +e.target.value : null })} className={inputCls} /></Field>
            <Field label="Longitude"><input type="number" step="any" value={editing.longitude ?? ""} onChange={(e) => setEditing({ ...editing, longitude: e.target.value ? +e.target.value : null })} className={inputCls} /></Field>
            <Field label="Best time to visit"><input value={editing.best_time_to_visit} onChange={(e) => setEditing({ ...editing, best_time_to_visit: e.target.value })} className={inputCls} /></Field>
            <Field label="Featured">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> Show on homepage</label>
            </Field>
          </div>
          <Field label="Description"><textarea rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputCls} /></Field>
          <Field label="Safety notes"><textarea rows={2} value={editing.safety_notes} onChange={(e) => setEditing({ ...editing, safety_notes: e.target.value })} className={inputCls} /></Field>
          <Field label="Transport info"><textarea rows={2} value={editing.transport_info} onChange={(e) => setEditing({ ...editing, transport_info: e.target.value })} className={inputCls} /></Field>

          <Field label="Hero image">
            <div className="flex gap-2 items-center">
              <input value={editing.hero_image} onChange={(e) => setEditing({ ...editing, hero_image: e.target.value })} placeholder="Image URL" className={inputCls} />
              <label className="px-3 py-2 rounded-xl glass-light text-xs cursor-pointer flex items-center gap-1.5"><Upload className="size-3.5" /> Upload
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  const url = await uploadImage(f, "destination-images");
                  if (url) setEditing({ ...editing, hero_image: url });
                }} />
              </label>
            </div>
            {editing.hero_image && <img src={editing.hero_image} alt="" className="mt-2 h-32 w-full object-cover rounded-xl" />}
          </Field>

          <Field label="Gallery images">
            <div className="flex flex-wrap gap-2">
              {editing.gallery_images.map((g, i) => (
                <div key={i} className="relative">
                  <img src={g} alt="" className="h-20 w-20 object-cover rounded-lg" />
                  <button onClick={() => setEditing({ ...editing, gallery_images: editing.gallery_images.filter((_, j) => j !== i) })} className="absolute -top-1 -right-1 size-5 rounded-full bg-destructive text-white text-xs"><X className="size-3 mx-auto" /></button>
                </div>
              ))}
              <label className="h-20 w-20 rounded-lg border border-dashed border-border grid place-items-center cursor-pointer hover:bg-white/5">
                <ImageIcon className="size-5 text-muted-foreground" />
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  const url = await uploadImage(f, "gallery-images");
                  if (url) setEditing({ ...editing, gallery_images: [...editing.gallery_images, url] });
                }} />
              </label>
            </div>
          </Field>
        </div>
      )}

      {isLoading ? <p className="text-muted-foreground">Loading…</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <div key={it.id} className="glass rounded-2xl p-4 flex gap-3">
              <img src={it.hero_image ?? ""} alt="" className="h-20 w-20 object-cover rounded-xl shrink-0" />
              <div className="flex-1 min-w-0">
                <Link to="/destination/$slug" params={{ slug: it.slug }} className="font-medium block truncate hover:underline">{it.title}</Link>
                <div className="text-xs text-muted-foreground">{it.category} · {it.location}</div>
                <div className="mt-2 flex gap-1.5">
                  <button onClick={() => setEditing(it as Dest)} className="text-xs px-2 py-1 rounded-md glass-light flex items-center gap-1"><Pencil className="size-3" /> Edit</button>
                  <button onClick={() => del(it.id)} className="text-xs px-2 py-1 rounded-md hover:bg-destructive/20 text-destructive flex items-center gap-1"><Trash2 className="size-3" /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ItinerariesTab({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
  const { data: items = [] } = useQuery({
    queryKey: ["admin-itineraries"],
    queryFn: async () => (await supabase.from("itineraries").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const [editing, setEditing] = useState<any>(null);

  const blank = { title: "", slug: "", description: "", budget_range: "", duration: "", hero_image: "", itinerary_content: "[]" };

  const save = async () => {
    let content;
    try { content = JSON.parse(editing.itinerary_content); } catch { alert("Itinerary JSON is invalid"); return; }
    const payload = { ...editing, itinerary_content: content };
    const op = editing.id ? supabase.from("itineraries").update(payload).eq("id", editing.id) : supabase.from("itineraries").insert(payload);
    const { error } = await op;
    if (error) return alert(error.message);
    setEditing(null); qc.invalidateQueries({ queryKey: ["admin-itineraries"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete itinerary?")) return;
    await supabase.from("itineraries").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-itineraries"] });
  };

  const startEdit = (it: any) => setEditing({ ...it, itinerary_content: JSON.stringify(it.itinerary_content, null, 2) });

  return (
    <div className="mt-6">
      <div className="flex justify-end mb-4">
        <button onClick={() => setEditing(blank)} className="px-4 py-2 rounded-xl bg-gradient-sunset text-primary-foreground text-sm shadow-glow flex items-center gap-1.5"><Plus className="size-4" /> New itinerary</button>
      </div>
      {editing && (
        <div className="glass rounded-3xl p-6 mb-6 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Title"><input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })} className={inputCls} /></Field>
            <Field label="Slug"><input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className={inputCls} /></Field>
            <Field label="Budget range"><input value={editing.budget_range ?? ""} onChange={(e) => setEditing({ ...editing, budget_range: e.target.value })} className={inputCls} /></Field>
            <Field label="Duration"><input value={editing.duration ?? ""} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} className={inputCls} /></Field>
            <Field label="Hero image URL"><input value={editing.hero_image ?? ""} onChange={(e) => setEditing({ ...editing, hero_image: e.target.value })} className={inputCls} /></Field>
          </div>
          <Field label="Description"><textarea rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputCls} /></Field>
          <Field label='Itinerary JSON (array of days: [{day:1,title,stops:[{time,title,detail}]}])'>
            <textarea rows={10} value={editing.itinerary_content} onChange={(e) => setEditing({ ...editing, itinerary_content: e.target.value })} className={`${inputCls} font-mono text-xs`} />
          </Field>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-lg glass-light text-sm">Cancel</button>
            <button onClick={save} className="px-3 py-1.5 rounded-lg bg-gradient-sunset text-primary-foreground text-sm">Save</button>
          </div>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((it) => (
          <div key={it.id} className="glass rounded-2xl p-4">
            <Link to="/itinerary/$slug" params={{ slug: it.slug }} className="font-medium hover:underline">{it.title}</Link>
            <p className="text-xs text-muted-foreground mt-1">{it.duration} · {it.budget_range}</p>
            <div className="mt-2 flex gap-1.5">
              <button onClick={() => startEdit(it)} className="text-xs px-2 py-1 rounded-md glass-light">Edit</button>
              <button onClick={() => del(it.id)} className="text-xs px-2 py-1 rounded-md hover:bg-destructive/20 text-destructive">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoutesTab({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
  const { data: dests = [] } = useQuery({
    queryKey: ["admin-dest-list"],
    queryFn: async () => (await supabase.from("destinations").select("id,title,slug")).data ?? [],
  });
  const { data: items = [] } = useQuery({
    queryKey: ["admin-routes"],
    queryFn: async () => (await supabase.from("routes").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const blank = { destination_id: "", route_name: "", difficulty: "Moderate", distance_km: 0, estimated_time: "", elevation_gain: 0, route_description: "" };
  const [editing, setEditing] = useState<any>(null);

  const save = async () => {
    if (!editing.destination_id) return alert("Pick a destination");
    const op = editing.id ? supabase.from("routes").update(editing).eq("id", editing.id) : supabase.from("routes").insert(editing);
    const { error } = await op;
    if (error) return alert(error.message);
    setEditing(null); qc.invalidateQueries({ queryKey: ["admin-routes"] });
  };

  return (
    <div className="mt-6">
      <div className="flex justify-end mb-4">
        <button onClick={() => setEditing(blank)} className="px-4 py-2 rounded-xl bg-gradient-sunset text-primary-foreground text-sm shadow-glow flex items-center gap-1.5"><Plus className="size-4" /> New route</button>
      </div>
      {editing && (
        <div className="glass rounded-3xl p-6 mb-6 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Destination">
              <select value={editing.destination_id} onChange={(e) => setEditing({ ...editing, destination_id: e.target.value })} className={inputCls}>
                <option value="">— select —</option>
                {dests.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </Field>
            <Field label="Route name"><input value={editing.route_name} onChange={(e) => setEditing({ ...editing, route_name: e.target.value })} className={inputCls} /></Field>
            <Field label="Difficulty">
              <select value={editing.difficulty} onChange={(e) => setEditing({ ...editing, difficulty: e.target.value })} className={inputCls}>
                {["Easy","Moderate","Hard"].map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Distance (km)"><input type="number" step="any" value={editing.distance_km ?? 0} onChange={(e) => setEditing({ ...editing, distance_km: +e.target.value })} className={inputCls} /></Field>
            <Field label="Estimated time"><input value={editing.estimated_time ?? ""} onChange={(e) => setEditing({ ...editing, estimated_time: e.target.value })} className={inputCls} /></Field>
            <Field label="Elevation gain (m)"><input type="number" value={editing.elevation_gain ?? 0} onChange={(e) => setEditing({ ...editing, elevation_gain: +e.target.value })} className={inputCls} /></Field>
          </div>
          <Field label="Description"><textarea rows={3} value={editing.route_description ?? ""} onChange={(e) => setEditing({ ...editing, route_description: e.target.value })} className={inputCls} /></Field>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-lg glass-light text-sm">Cancel</button>
            <button onClick={save} className="px-3 py-1.5 rounded-lg bg-gradient-sunset text-primary-foreground text-sm">Save</button>
          </div>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((r) => {
          const dest = dests.find((d) => d.id === r.destination_id);
          return (
            <div key={r.id} className="glass rounded-2xl p-4">
              <div className="font-medium">{r.route_name}</div>
              <div className="text-xs text-muted-foreground">{dest?.title} · {r.difficulty} · {r.distance_km}km</div>
              <div className="mt-2 flex gap-1.5">
                <button onClick={() => setEditing(r)} className="text-xs px-2 py-1 rounded-md glass-light">Edit</button>
                <button onClick={async () => { if (confirm("Delete?")) { await supabase.from("routes").delete().eq("id", r.id); qc.invalidateQueries({ queryKey: ["admin-routes"] }); } }} className="text-xs px-2 py-1 rounded-md hover:bg-destructive/20 text-destructive">Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const inputCls = "w-full bg-white/5 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      {children}
    </label>
  );
}