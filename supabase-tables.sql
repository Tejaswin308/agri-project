-- Supabase table creation for RythuMitra

create table if not exists public.farmer_enquiries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null,
  phone text not null,
  crop text not null,
  message text not null
);

create table if not exists public.crop_scans (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text,
  phone text,
  crop text,
  disease text,
  confidence text,
  symptoms text,
  treatments text,
  image_url text
);
