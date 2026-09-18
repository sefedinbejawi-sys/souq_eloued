-- سوق الوادي | Professional listings workflow
create extension if not exists pgcrypto;

do $$ begin
  create type public.listing_status as enum ('draft', 'active', 'sold', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.user_role as enum ('user', 'moderator', 'admin');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, full_name text not null default '', phone text, avatar_url text,
  role public.user_role not null default 'user', is_verified boolean not null default false,
  is_banned boolean not null default false, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.municipalities (
  id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique,
  is_active boolean not null default true, created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique,
  icon text, sort_order smallint not null default 0, is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  municipality_id uuid not null references public.municipalities(id),
  category_id uuid not null references public.categories(id),
  title text not null check (char_length(title) between 3 and 120),
  description text,
  price bigint not null check (price >= 0),
  currency text not null default 'DZD',
  image_urls text[] not null default '{}',
  whatsapp text,
  phone text,
  status public.listing_status not null default 'draft',
  is_featured boolean not null default false,
  views_count integer not null default 0,
  published_at timestamptz,
  submitted_at timestamptz not null default now(),
  expires_at timestamptz,
  rejection_reason text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Safe migration for an existing database.
alter table public.listings add column if not exists submitted_at timestamptz not null default now();
alter table public.listings add column if not exists expires_at timestamptz;
alter table public.listings add column if not exists rejection_reason text;
alter table public.listings add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;
alter table public.listings add column if not exists reviewed_at timestamptz;
alter table public.listings alter column published_at drop not null;

create index if not exists listings_active_search_idx on public.listings(status, published_at desc);
create index if not exists listings_location_idx on public.listings(municipality_id, category_id);
create index if not exists listings_seller_idx on public.listings(seller_id);
create index if not exists listings_review_idx on public.listings(status, submitted_at desc);
create index if not exists listings_expiry_idx on public.listings(expires_at);

alter table public.profiles enable row level security;
alter table public.municipalities enable row level security;
alter table public.categories enable row level security;
alter table public.listings enable row level security;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and is_banned = false);
$$;
create or replace function public.is_moderator() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','moderator') and is_banned = false);
$$;

-- Enforce the workflow at database level; the browser cannot bypass moderation.
create or replace function public.enforce_listing_workflow()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.profiles where id = auth.uid() and is_banned = true) then
    raise exception 'الحساب محظور ولا يمكنه إدارة الإعلانات';
  end if;

  if tg_op = 'INSERT' then
    new.seller_id := auth.uid();
    new.status := 'draft';
    new.is_featured := false;
    new.published_at := null;
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.rejection_reason := null;
    new.submitted_at := now();
    return new;
  end if;

  if not public.is_moderator() then
    if new.seller_id <> old.seller_id then raise exception 'seller_id cannot be changed'; end if;
    new.is_featured := old.is_featured;
    new.reviewed_by := old.reviewed_by;
    new.reviewed_at := old.reviewed_at;

    -- Sellers may mark an active ad sold/archived, but may never approve it themselves.
    if new.status = 'active' and old.status <> 'active' then
      new.status := 'draft';
    end if;

    -- Any substantive edit of a published ad returns it to moderation.
    if old.status = 'active' and (
      new.title is distinct from old.title or new.description is distinct from old.description or
      new.price is distinct from old.price or new.image_urls is distinct from old.image_urls or
      new.phone is distinct from old.phone or new.whatsapp is distinct from old.whatsapp or
      new.category_id is distinct from old.category_id or new.municipality_id is distinct from old.municipality_id
    ) then
      new.status := 'draft';
      new.published_at := null;
      new.rejection_reason := null;
      new.reviewed_by := null;
      new.reviewed_at := null;
      new.submitted_at := now();
    end if;
  else
    if new.status = 'active' and (old.status is distinct from 'active') then
      new.published_at := coalesce(new.published_at, now());
      new.reviewed_by := auth.uid();
      new.reviewed_at := now();
      new.rejection_reason := null;
    elsif new.status = 'archived' and old.status = 'draft' and new.rejection_reason is null then
      new.reviewed_by := auth.uid();
      new.reviewed_at := now();
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists listings_workflow_trigger on public.listings;
create trigger listings_workflow_trigger before insert or update on public.listings
for each row execute function public.enforce_listing_workflow();

-- Moderation audit trail.
create table if not exists public.listing_reviews (
  id bigint generated always as identity primary key,
  listing_id uuid not null references public.listings(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  from_status public.listing_status,
  to_status public.listing_status not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists listing_reviews_listing_idx on public.listing_reviews(listing_id, created_at desc);
alter table public.listing_reviews enable row level security;
drop policy if exists "Moderators read listing reviews" on public.listing_reviews;
create policy "Moderators read listing reviews" on public.listing_reviews for select to authenticated using (public.is_moderator());
drop policy if exists "Moderators create listing reviews" on public.listing_reviews;
create policy "Moderators create listing reviews" on public.listing_reviews for insert to authenticated with check (public.is_moderator() and reviewer_id = auth.uid());

-- Policies
 drop policy if exists "Public profiles are viewable" on public.profiles;
create policy "Public profiles are viewable" on public.profiles for select using (true);
drop policy if exists "Users create own profile" on public.profiles;
create policy "Users create own profile" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Active municipalities are public" on public.municipalities;
create policy "Active municipalities are public" on public.municipalities for select using (is_active = true);
drop policy if exists "Active categories are public" on public.categories;
create policy "Active categories are public" on public.categories for select using (is_active = true);

drop policy if exists "Active listings are public" on public.listings;
create policy "Active listings are public" on public.listings for select using (
  (status = 'active' and (expires_at is null or expires_at > now())) or seller_id = auth.uid() or public.is_moderator()
);
drop policy if exists "Authenticated users create listings" on public.listings;
create policy "Authenticated users create listings" on public.listings for insert to authenticated with check (seller_id = auth.uid() and exists (select 1 from public.profiles where id = auth.uid() and is_banned = false));
drop policy if exists "Owners update listings" on public.listings;
create policy "Owners update listings" on public.listings for update to authenticated using (seller_id = auth.uid()) with check (seller_id = auth.uid());
drop policy if exists "Owners delete listings" on public.listings;
create policy "Owners delete listings" on public.listings for delete to authenticated using (seller_id = auth.uid());
drop policy if exists "Admins manage listings" on public.listings;
create policy "Admins manage listings" on public.listings for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Moderators review listings" on public.listings;
create policy "Moderators review listings" on public.listings for select to authenticated using (public.is_moderator());
drop policy if exists "Moderators update listings" on public.listings;
create policy "Moderators update listings" on public.listings for update to authenticated using (public.is_moderator()) with check (public.is_moderator());

insert into public.municipalities (name, slug) values
  ('الوادي','el-oued'),('قمار','guemar'),('كوينين','kouinine'),('البياضة','el-bayadha'),('الرباح','robah'),
  ('حاسي خليفة','hassi-khelifa'),('الدبيلة','debila'),('الرقيبة','reguiba'),('ورماس','ouermes'),('الطالب العربي','taleb-arabi'),('النخلة','nakhla'),('تغزوت','taghzout')
on conflict (slug) do nothing;
insert into public.categories (name, slug, sort_order) values
  ('الفلاحة والتمور','agriculture-dates',1),('العقارات','real-estate',2),('المركبات والآليات','vehicles-machinery',3),
  ('الخدمات والحرف','services-crafts',4),('الإلكترونيات','electronics',5),('المنزل والحديقة','home-garden',6)
on conflict (slug) do nothing;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare display_name text;
begin
  display_name := coalesce(nullif(new.raw_user_meta_data ->> 'full_name',''), split_part(coalesce(new.email,'مستخدم'),'@',1), 'مستخدم سوق الوادي');
  insert into public.profiles (id,email,full_name,phone,role,is_banned,is_verified)
  values (new.id,new.email,display_name,nullif(new.raw_user_meta_data ->> 'phone',''),'user',false,false)
  on conflict (id) do update set full_name=excluded.full_name, phone=coalesce(excluded.phone,public.profiles.phone), email=excluded.email, updated_at=now();
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Storage
insert into storage.buckets (id,name,public) values ('listing-images','listing-images',true) on conflict (id) do update set public=true;
drop policy if exists "Public listing images are viewable" on storage.objects;
create policy "Public listing images are viewable" on storage.objects for select using (bucket_id='listing-images');
drop policy if exists "Users upload their listing images" on storage.objects;
create policy "Users upload their listing images" on storage.objects for insert to authenticated with check (bucket_id='listing-images' and (storage.foldername(name))[1]=(select auth.uid()::text));
drop policy if exists "Users update their listing images" on storage.objects;
create policy "Users update their listing images" on storage.objects for update to authenticated using (bucket_id='listing-images' and (storage.foldername(name))[1]=(select auth.uid()::text)) with check (bucket_id='listing-images' and (storage.foldername(name))[1]=(select auth.uid()::text));
drop policy if exists "Users delete their listing images" on storage.objects;
create policy "Users delete their listing images" on storage.objects for delete to authenticated using (bucket_id='listing-images' and (storage.foldername(name))[1]=(select auth.uid()::text));

-- Visits
create table if not exists public.site_visits (id bigint generated always as identity primary key, visitor_id uuid not null, path text not null default '/', referrer text, created_at timestamptz not null default now());
create index if not exists site_visits_created_idx on public.site_visits(created_at desc);
create index if not exists site_visits_visitor_idx on public.site_visits(visitor_id);
alter table public.site_visits enable row level security;
drop policy if exists "Anyone can log a visit" on public.site_visits;
create policy "Anyone can log a visit" on public.site_visits for insert with check (true);
drop policy if exists "Admins read visits" on public.site_visits;
create policy "Admins read visits" on public.site_visits for select to authenticated using (public.is_moderator());

-- Set your first administrator manually after creating the account:
-- update public.profiles set role='admin' where id=(select id from auth.users where email='admin@example.com');
