create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  email text not null,
  full_name text,
  role text not null default 'viewer' check (role in ('admin','operator','viewer')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, location text not null default '', status text not null default 'offline' check (status in ('online','offline','warning','unconfigured')),
  master_volume int not null default 70 check (master_volume between 0 and 100), is_muted boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade, name text not null, label text not null default '',
  volume int not null default 65 check (volume between 0 and 100), is_muted boolean not null default false,
  auto_mode boolean not null default true, current_level_db numeric(6,2), peak_level_db numeric(6,2), controller_id uuid,
  last_telemetry_at timestamptz
);
create table if not exists public.controllers (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  device_id text unique not null, room_id uuid references public.rooms(id) on delete set null, name text not null,
  status text not null default 'pending' check (status in ('pending','connected','disconnected','disabled')),
  firmware_version text not null default 'unknown', last_seen timestamptz, dsp_load numeric(6,2), latency numeric(8,2),
  token_hash text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.zones drop constraint if exists zones_controller_id_fkey;
alter table public.zones add constraint zones_controller_id_fkey foreign key (controller_id) references public.controllers(id) on delete set null;
create table if not exists public.microphones (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade, zone_id uuid references public.zones(id) on delete set null,
  name text not null, description text, status text not null default 'offline' check (status in ('online','offline')),
  volume int not null default 75 check (volume between 0 and 100), is_muted boolean not null default false, last_telemetry_at timestamptz
);
create table if not exists public.audio_readings (
  id bigserial primary key, organization_id uuid not null references public.organizations(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade, zone_id uuid references public.zones(id) on delete set null,
  microphone_id uuid references public.microphones(id) on delete set null, rms_db numeric(6,2) not null, peak_db numeric(6,2) not null,
  clipping boolean not null default false, recorded_at timestamptz not null default now()
);
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete cascade, category text not null, severity text not null, title text not null,
  message text not null, resolved boolean not null default false, created_at timestamptz not null default now(), resolved_at timestamptz
);
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null, actor_email text, actor_role text,
  operation text not null, target text, old_value jsonb, new_value jsonb, source text not null check (source in ('manual','ai','controller')),
  ip inet, request_id text, created_at timestamptz not null default now()
);

create or replace function public.user_org_id() returns uuid language sql stable security definer set search_path = public as $$ select organization_id from public.profiles where id = auth.uid() $$;
create or replace function public.user_role() returns text language sql stable security definer set search_path = public as $$ select role from public.profiles where id = auth.uid() $$;

-- RLS is tenant-scoped; service role is used only by the server and bypasses these policies.
do $$ declare t text; begin foreach t in array array['profiles','rooms','zones','controllers','microphones','audio_readings','alerts','audit_logs'] loop execute format('alter table public.%I enable row level security', t); end loop; end $$;
create policy profiles_self on public.profiles for select to authenticated using (id = auth.uid());
create policy tenant_read_rooms on public.rooms for select to authenticated using (organization_id = public.user_org_id());
create policy tenant_read_zones on public.zones for select to authenticated using (organization_id = public.user_org_id());
create policy tenant_read_controllers on public.controllers for select to authenticated using (organization_id = public.user_org_id());
create policy tenant_read_mics on public.microphones for select to authenticated using (organization_id = public.user_org_id());
create policy tenant_read_telemetry on public.audio_readings for select to authenticated using (organization_id = public.user_org_id());
create policy tenant_read_alerts on public.alerts for select to authenticated using (organization_id = public.user_org_id());
create policy tenant_read_audit on public.audit_logs for select to authenticated using (organization_id = public.user_org_id());
create policy operator_update_rooms on public.rooms for update to authenticated using (organization_id = public.user_org_id() and public.user_role() in ('admin','operator')) with check (organization_id = public.user_org_id());
create policy operator_update_zones on public.zones for update to authenticated using (organization_id = public.user_org_id() and public.user_role() in ('admin','operator')) with check (organization_id = public.user_org_id());
create policy operator_update_mics on public.microphones for update to authenticated using (organization_id = public.user_org_id() and public.user_role() in ('admin','operator')) with check (organization_id = public.user_org_id());
create policy audit_append_only on public.audit_logs for insert to authenticated with check (actor_id = auth.uid() and organization_id = public.user_org_id());
revoke update, delete on public.audit_logs from authenticated;

create or replace function public.mark_stale_controllers() returns void language sql security definer set search_path = public as $$ update public.controllers set status='disconnected', updated_at=now() where status='connected' and (last_seen is null or last_seen < now() - interval '90 seconds'); $$;
