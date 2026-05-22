
-- Roles
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users can view their own roles" on public.user_roles
  for select using (auth.uid() = user_id);
create policy "Admins manage roles" on public.user_roles
  for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Timestamp trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- Destinations
create table public.destinations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null,
  location text,
  description text,
  hero_image text,
  gallery_images text[] default '{}',
  estimated_budget text,
  difficulty_level text,
  duration text,
  latitude numeric,
  longitude numeric,
  best_time_to_visit text,
  safety_notes text,
  transport_info text,
  entry_fee text,
  featured boolean not null default false,
  last_updated timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.destinations enable row level security;
create policy "Destinations are public" on public.destinations for select using (true);
create policy "Admins manage destinations" on public.destinations
  for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger destinations_updated_at before update on public.destinations
  for each row execute function public.set_updated_at();
create index on public.destinations (category);
create index on public.destinations (featured);

-- Itineraries
create table public.itineraries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  budget_range text,
  duration text,
  destinations_included uuid[] default '{}',
  itinerary_content jsonb not null default '[]'::jsonb,
  hero_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.itineraries enable row level security;
create policy "Itineraries are public" on public.itineraries for select using (true);
create policy "Admins manage itineraries" on public.itineraries
  for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger itineraries_updated_at before update on public.itineraries
  for each row execute function public.set_updated_at();

-- Routes
create table public.routes (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations(id) on delete cascade,
  route_name text not null,
  difficulty text,
  distance_km numeric,
  estimated_time text,
  gps_coordinates jsonb default '[]'::jsonb,
  elevation_gain numeric,
  route_description text,
  created_at timestamptz not null default now()
);
alter table public.routes enable row level security;
create policy "Routes are public" on public.routes for select using (true);
create policy "Admins manage routes" on public.routes
  for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create index on public.routes (destination_id);

-- Updates
create table public.updates (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations(id) on delete cascade,
  update_type text not null,
  update_content text not null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.updates enable row level security;
create policy "Updates are public" on public.updates for select using (true);
create policy "Admins manage updates" on public.updates
  for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create index on public.updates (destination_id, created_at desc);

-- Storage buckets
insert into storage.buckets (id, name, public) values
  ('destination-images', 'destination-images', true),
  ('gallery-images', 'gallery-images', true),
  ('route-images', 'route-images', true),
  ('creator-uploads', 'creator-uploads', true)
on conflict (id) do nothing;

create policy "Public read destination images" on storage.objects for select
  using (bucket_id in ('destination-images','gallery-images','route-images','creator-uploads'));
create policy "Admins upload destination images" on storage.objects for insert
  with check (bucket_id in ('destination-images','gallery-images','route-images') and public.has_role(auth.uid(),'admin'));
create policy "Admins update destination images" on storage.objects for update
  using (bucket_id in ('destination-images','gallery-images','route-images') and public.has_role(auth.uid(),'admin'));
create policy "Admins delete destination images" on storage.objects for delete
  using (bucket_id in ('destination-images','gallery-images','route-images') and public.has_role(auth.uid(),'admin'));
create policy "Authenticated upload creator content" on storage.objects for insert
  with check (bucket_id = 'creator-uploads' and auth.uid() is not null and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users update own creator content" on storage.objects for update
  using (bucket_id = 'creator-uploads' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users delete own creator content" on storage.objects for delete
  using (bucket_id = 'creator-uploads' and auth.uid()::text = (storage.foldername(name))[1]);
