-- سوق الوادي | Supabase schema النهائي
-- التسجيل: full_name + username + email + password
-- الأدوار المسموحة حصراً: user, moderator, admin

create extension if not exists pgcrypto;
do $$ begin create type public.listing_status as enum ('draft','active','sold','archived'); exception when duplicate_object then null; end $$;
do $$ begin create type public.user_role as enum ('user','moderator','admin'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text not null,
  full_name text not null default '',
  phone text,
  avatar_url text,
  role public.user_role not null default 'user',
  is_banned boolean not null default false,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists is_banned boolean not null default false;
alter table public.profiles add column if not exists is_verified boolean not null default false;
create unique index if not exists profiles_username_unique_idx on public.profiles(lower(username));

create table if not exists public.municipalities (id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique, is_active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.categories (id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique, icon text, sort_order smallint not null default 0, is_active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(), seller_id uuid not null references public.profiles(id) on delete cascade,
  municipality_id uuid not null references public.municipalities(id), category_id uuid not null references public.categories(id),
  title text not null check (char_length(title) between 3 and 120), description text, price bigint not null check (price >= 0), currency text not null default 'DZD', image_urls text[] not null default '{}', whatsapp text, phone text,
  status public.listing_status not null default 'draft', is_featured boolean not null default false, views_count integer not null default 0, published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and is_banned = false); $$;
create or replace function public.is_moderator() returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','moderator') and is_banned = false); $$;
create or replace function public.is_banned() returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.profiles where id = auth.uid() and is_banned = true); $$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare display_name text; base_username text; chosen_username text; suffix integer := 0;
begin
  display_name := coalesce(nullif(new.raw_user_meta_data ->> 'full_name',''), split_part(new.email,'@',1), 'مستخدم سوق الوادي');
  base_username := lower(regexp_replace(coalesce(nullif(new.raw_user_meta_data ->> 'username',''), split_part(new.email,'@',1)), '[^a-zA-Z0-9_-]', '', 'g'));
  if base_username = '' then base_username := 'user_' || substr(replace(new.id::text,'-',''),1,8); end if;
  chosen_username := base_username;
  while exists (select 1 from public.profiles where lower(username) = lower(chosen_username) and id <> new.id) loop suffix := suffix + 1; chosen_username := base_username || '_' || suffix; end loop;
  insert into public.profiles (id,email,username,full_name,phone,role,is_banned,is_verified) values (new.id,new.email,chosen_username,display_name,nullif(new.raw_user_meta_data ->> 'phone',''),'user',false,false) on conflict (id) do update set email=excluded.email,username=excluded.username,full_name=excluded.full_name,updated_at=now();
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security; alter table public.municipalities enable row level security; alter table public.categories enable row level security; alter table public.listings enable row level security;
drop policy if exists "Public profiles are viewable" on public.profiles; create policy "Public profiles are viewable" on public.profiles for select using (true);
drop policy if exists "Users update own profile" on public.profiles; create policy "Users update own profile" on public.profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid());
drop policy if exists "Admins manage profiles" on public.profiles; create policy "Admins manage profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Active municipalities are public" on public.municipalities; create policy "Active municipalities are public" on public.municipalities for select using (is_active=true);
drop policy if exists "Active categories are public" on public.categories; create policy "Active categories are public" on public.categories for select using (is_active=true);
drop policy if exists "Public active or own listings" on public.listings; create policy "Public active or own listings" on public.listings for select using (status='active' or seller_id=auth.uid() or public.is_moderator());
drop policy if exists "Users create own listings" on public.listings; create policy "Users create own listings" on public.listings for insert to authenticated with check (seller_id=auth.uid() and not public.is_banned());
drop policy if exists "Users update own listings" on public.listings; create policy "Users update own listings" on public.listings for update to authenticated using (seller_id=auth.uid() and not public.is_banned()) with check (seller_id=auth.uid() and not public.is_banned());
drop policy if exists "Moderators update listings" on public.listings; create policy "Moderators update listings" on public.listings for update to authenticated using (public.is_moderator()) with check (public.is_moderator());
drop policy if exists "Users delete own listings" on public.listings; create policy "Users delete own listings" on public.listings for delete to authenticated using (seller_id=auth.uid() and not public.is_banned());
drop policy if exists "Admins delete all listings" on public.listings; create policy "Admins delete all listings" on public.listings for delete to authenticated using (public.is_admin());

insert into public.municipalities(name,slug) values ('الوادي','el-oued'),('قمار','guemar'),('كوينين','kouinine'),('البياضة','el-bayadha'),('الرباح','robah'),('حاسي خليفة','hassi-khelifa'),('الدبيلة','debila'),('الرقيبة','reguiba') on conflict (slug) do nothing;
insert into public.categories(name,slug,sort_order) values ('الفلاحة والتمور','agriculture-dates',1),('العقارات','real-estate',2),('المركبات والآليات','vehicles-machinery',3),('الخدمات والحرف','services-crafts',4) on conflict (slug) do nothing;

-- بعد إنشاء أول حساب وتسجيل الدخول نفّذ:
-- update public.profiles set role='admin', is_banned=false where email='admin@example.com';
