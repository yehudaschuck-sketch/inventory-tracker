-- =============================================================================
-- Inventory Tracker — Supabase setup
-- Run this once in your Supabase project: SQL Editor -> New query -> paste -> Run
-- =============================================================================

-- 1. The items table -----------------------------------------------------------
create table if not exists public.items (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  category    text,
  quantity    integer not null default 1,
  location    text,
  notes       text,
  photo_url   text,
  added_by    text
);

-- Helpful index for sorting/filtering by category.
create index if not exists items_category_idx on public.items (category);

-- 2. Row Level Security --------------------------------------------------------
-- Any signed-in team member can read and write the shared inventory.
alter table public.items enable row level security;

drop policy if exists "team can read"   on public.items;
drop policy if exists "team can insert" on public.items;
drop policy if exists "team can update" on public.items;
drop policy if exists "team can delete" on public.items;

create policy "team can read"   on public.items for select to authenticated using (true);
create policy "team can insert" on public.items for insert to authenticated with check (true);
create policy "team can update" on public.items for update to authenticated using (true);
create policy "team can delete" on public.items for delete to authenticated using (true);

-- 3. Photo storage bucket ------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;

-- Public read for photos; signed-in members can upload/replace/delete.
drop policy if exists "photos public read"   on storage.objects;
drop policy if exists "photos team write"     on storage.objects;
drop policy if exists "photos team update"    on storage.objects;
drop policy if exists "photos team delete"    on storage.objects;

create policy "photos public read" on storage.objects
  for select using (bucket_id = 'item-photos');
create policy "photos team write" on storage.objects
  for insert to authenticated with check (bucket_id = 'item-photos');
create policy "photos team update" on storage.objects
  for update to authenticated using (bucket_id = 'item-photos');
create policy "photos team delete" on storage.objects
  for delete to authenticated using (bucket_id = 'item-photos');
