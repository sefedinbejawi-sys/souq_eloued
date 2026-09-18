-- سوق الوادي / Souq El Oued - Professional marketplace upgrade
-- Safe migration: keeps existing listings, users, storage and Google Auth.

alter table public.profiles add column if not exists account_type text not null default 'both';
alter table public.profiles add column if not exists username text;
update public.profiles set username = lower(regexp_replace(coalesce(nullif(split_part(email,'@',1),''),'user'),'[^a-zA-Z0-9_]+','-','g')) || '-' || substr(id::text,1,8) where username is null;
create unique index if not exists profiles_username_unique_idx on public.profiles(username) where username is not null;
alter table public.profiles drop constraint if exists profiles_account_type_check;
alter table public.profiles add constraint profiles_account_type_check check (account_type in ('buyer','seller','both'));

alter table public.listings add column if not exists republish_available_at timestamptz;
alter table public.listings add column if not exists last_republished_at timestamptz;
alter table public.listings add column if not exists sold_at timestamptz;
alter table public.listings add column if not exists renew_count integer not null default 0;

-- Backfill renewal dates for already published listings.
update public.listings
set republish_available_at = coalesce(republish_available_at, published_at + interval '7 days')
where status = 'active' and published_at is not null and republish_available_at is null;

-- Keep the seven-day renewal clock aligned whenever moderation publishes an ad.
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
    new.republish_available_at := old.republish_available_at;
    new.last_republished_at := old.last_republished_at;
    new.renew_count := old.renew_count;

    if new.status = 'active' and old.status <> 'active' then
      new.status := old.status;
    end if;

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
      
      new.republish_available_at := coalesce(new.republish_available_at, new.published_at + interval '7 days');
      new.reviewed_by := auth.uid();
      new.reviewed_at := now();
      new.rejection_reason := null;
    elsif new.status = 'sold' and old.status <> 'sold' then
      new.sold_at := coalesce(new.sold_at, now());
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- Renewal RPC: seller can renew only an active, unsold listing after seven days.
create or replace function public.republish_listing(p_listing_id uuid)
returns public.listings
language plpgsql
security definer
set search_path = public
as $$
declare result_row public.listings;
begin
  update public.listings
  set published_at = now(),
      republish_available_at = now() + interval '7 days',
      last_republished_at = now(),
      renew_count = coalesce(renew_count,0) + 1,
      expires_at = null,
      updated_at = now()
  where id = p_listing_id
    and seller_id = auth.uid()
    and status = 'active'
    and coalesce(sold_at, null) is null
    and coalesce(republish_available_at, published_at + interval '7 days') <= now()
  returning * into result_row;

  if result_row.id is null then
    raise exception 'لا يمكن إعادة نشر هذا الإعلان الآن. يجب أن يكون منشوراً وغير مباع وأن تمر 7 أيام على آخر نشر.';
  end if;
  return result_row;
end;
$$;
revoke all on function public.republish_listing(uuid) from public;
grant execute on function public.republish_listing(uuid) to authenticated;

-- Create/refresh profiles for OAuth accounts and preserve selected account type.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare display_name text; chosen_type text;
begin
  display_name := coalesce(nullif(new.raw_user_meta_data ->> 'full_name',''), split_part(coalesce(new.email,'مستخدم'),'@',1), 'مستخدم سوق الوادي');
  chosen_type := case when new.raw_user_meta_data ->> 'account_type' in ('buyer','seller','both') then new.raw_user_meta_data ->> 'account_type' else 'both' end;
  insert into public.profiles (id,email,full_name,phone,role,is_banned,is_verified,account_type,username)
  values (new.id,new.email,display_name,nullif(new.raw_user_meta_data ->> 'phone',''),'user',false,false,chosen_type,
          lower(regexp_replace(coalesce(nullif(split_part(new.email,'@',1),''),'user'),'[^a-zA-Z0-9_]+','-','g')) || '-' || substr(new.id::text,1,8))
  on conflict (id) do update set full_name=excluded.full_name, phone=coalesce(excluded.phone,public.profiles.phone), email=excluded.email, account_type=coalesce(public.profiles.account_type,excluded.account_type), updated_at=now();
  return new;
end; $$;

-- Note: execute the complete existing schema.sql first if your project has not created the base tables yet.
