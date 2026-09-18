-- سوق الوادي | Supabase schema (نسخة مُصحَّحة وموحّدة)
-- نفّذ هذا الملف كاملاً من Supabase SQL Editor على مشروع نظيف أو موجود.
-- ملاحظة: هذه النسخة تزيل الاعتماد على جدول organizations غير المُعرَّف سابقاً،
-- وتوحّد أدوار المستخدمين مع ما تستخدمه الواجهة فعلياً (user / moderator / admin).

create extension if not exists pgcrypto;

do $$ begin
  create type public.listing_status as enum ('draft', 'active', 'sold', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.user_role as enum ('user', 'moderator', 'admin');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null default '',
  phone text,
  avatar_url text,
  role public.user_role not null default 'user',
  is_verified boolean not null default false,
  is_banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.municipalities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  icon text,
  sort_order smallint not null default 0,
  is_active boolean not null default true,
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
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_active_search_idx on public.listings(status, published_at desc);
create index if not exists listings_location_idx on public.listings(municipality_id, category_id);
create index if not exists listings_seller_idx on public.listings(seller_id);

alter table public.profiles enable row level security;
alter table public.municipalities enable row level security;
alter table public.categories enable row level security;
alter table public.listings enable row level security;

-- دوال مساعدة للأدوار (security definer لتفادي التكرار اللانهائي في سياسات RLS)
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and is_banned = false); $$;

create or replace function public.is_moderator() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'moderator') and is_banned = false); $$;

-- profiles
drop policy if exists "Public profiles are viewable" on public.profiles;
create policy "Public profiles are viewable" on public.profiles for select using (true);
drop policy if exists "Users create own profile" on public.profiles;
create policy "Users create own profile" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- municipalities / categories
drop policy if exists "Active municipalities are public" on public.municipalities;
create policy "Active municipalities are public" on public.municipalities for select using (is_active = true);
drop policy if exists "Active categories are public" on public.categories;
create policy "Active categories are public" on public.categories for select using (is_active = true);

-- listings
drop policy if exists "Active listings are public" on public.listings;
create policy "Active listings are public" on public.listings for select using (status = 'active' or seller_id = auth.uid());
drop policy if exists "Authenticated users create listings" on public.listings;
create policy "Authenticated users create listings" on public.listings for insert to authenticated with check (seller_id = auth.uid());
drop policy if exists "Owners update listings" on public.listings;
create policy "Owners update listings" on public.listings for update to authenticated using (seller_id = auth.uid()) with check (seller_id = auth.uid());
drop policy if exists "Owners archive listings" on public.listings;
create policy "Owners archive listings" on public.listings for delete to authenticated using (seller_id = auth.uid());
drop policy if exists "Admins manage listings" on public.listings;
create policy "Admins manage listings" on public.listings for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Moderators review listings" on public.listings;
create policy "Moderators review listings" on public.listings for select to authenticated using (public.is_moderator());
drop policy if exists "Moderators update listings" on public.listings;
create policy "Moderators update listings" on public.listings for update to authenticated using (public.is_moderator()) with check (public.is_moderator());

insert into public.municipalities (name, slug) values
  ('الوادي', 'el-oued'), ('قمار', 'guemar'), ('كوينين', 'kouinine'), ('البياضة', 'el-bayadha'),
  ('الرباح', 'robah'), ('حاسي خليفة', 'hassi-khelifa'), ('الدبيلة', 'debila'), ('الرقيبة', 'reguiba'),
  ('ورماس', 'ouermes'), ('الطالب العربي', 'taleb-arabi'), ('النخلة', 'nakhla'), ('تغزوت', 'taghzout')
on conflict (slug) do nothing;

insert into public.categories (name, slug, sort_order) values
  ('الفلاحة والتمور', 'agriculture-dates', 1), ('العقارات', 'real-estate', 2),
  ('المركبات والآليات', 'vehicles-machinery', 3), ('الخدمات والحرف', 'services-crafts', 4),
  ('الإلكترونيات', 'electronics', 5), ('المنزل والحديقة', 'home-garden', 6)
on conflict (slug) do nothing;

-- إنشاء صف profiles تلقائياً عند تسجيل مستخدم جديد (بريد إلكتروني + كلمة مرور)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare display_name text;
begin
  display_name := coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, 'مستخدم'), '@', 1), 'مستخدم سوق الوادي');
  insert into public.profiles (id, email, full_name, phone, role, is_banned, is_verified)
  values (new.id, new.email, display_name, nullif(new.raw_user_meta_data ->> 'phone', ''), 'user', false, false)
  on conflict (id) do update set
    full_name = excluded.full_name,
    phone = coalesce(excluded.phone, public.profiles.phone),
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Supabase Storage: صور الإعلانات
insert into storage.buckets (id, name, public) values ('listing-images', 'listing-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public listing images are viewable" on storage.objects;
create policy "Public listing images are viewable" on storage.objects
for select using (bucket_id = 'listing-images');

drop policy if exists "Users upload their listing images" on storage.objects;
create policy "Users upload their listing images" on storage.objects
for insert to authenticated
with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists "Users update their listing images" on storage.objects;
create policy "Users update their listing images" on storage.objects
for update to authenticated
using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid()::text))
with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists "Users delete their listing images" on storage.objects;
create policy "Users delete their listing images" on storage.objects
for delete to authenticated
using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid()::text));

-- لجعل أول مدير للموقع، نفّذ بعد إنشاء حسابك من الواجهة:
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'admin@example.com');

-- ================== زيارات الموقع (لوحة التحكم) ==================
create table if not exists public.site_visits (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  path text not null default '/',
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists site_visits_created_idx on public.site_visits(created_at desc);
create index if not exists site_visits_visitor_idx on public.site_visits(visitor_id);

alter table public.site_visits enable row level security;

-- أي زائر (حتى غير المسجَّل) يمكنه تسجيل زيارة، لكن لا يمكنه قراءة أو تعديل الزيارات
drop policy if exists "Anyone can log a visit" on public.site_visits;
create policy "Anyone can log a visit" on public.site_visits for insert with check (true);

-- فقط admin أو moderator يمكنهم رؤية إحصائيات الزيارات
drop policy if exists "Admins read visits" on public.site_visits;
create policy "Admins read visits" on public.site_visits for select to authenticated using (public.is_moderator());
