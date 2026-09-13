/**
 * Supabase Client & Schema Definitions
 * Supporting authentication, database tables, and Row Level Security (RLS)
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from Vite environment or user settings
const defaultUrl = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SUPABASE_URL || '';
const defaultAnonKey = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(customUrl?: string, customKey?: string): SupabaseClient | null {
  const url = customUrl || defaultUrl;
  const key = customKey || defaultAnonKey;

  if (!url || !key || url.includes('xyzcompany') || key.includes('your-anon-key')) {
    return null;
  }

  if (!supabaseInstance || customUrl || customKey) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.error('Supabase initialization error:', e);
      return null;
    }
  }

  return supabaseInstance;
}

export const supabase = getSupabaseClient();
export const isSupabaseConfigured = !!supabase;

export const SUPABASE_SQL_SCHEMA = `-- ==========================================================
-- AI Audio Robot — Production Supabase Schema & Security (RLS)
-- Subdomain: audio.myeloued.com
-- ==========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Linked to Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role text not null check (role in ('admin', 'operator', 'viewer')) default 'viewer',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Rooms Table
create table if not exists public.rooms (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  location text not null,
  status text not null check (status in ('online', 'offline', 'warning', 'unconfigured')) default 'offline',
  master_volume integer not null check (master_volume between 0 and 100) default 70,
  is_muted boolean not null default false,
  target_spl_db integer default 75,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Audio Zones Table
create table if not exists public.zones (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.rooms on delete cascade not null,
  name text not null, -- e.g. "Zone A"
  label text not null, -- e.g. "المنصة الرئيسية"
  volume integer not null check (volume between 0 and 100) default 65,
  is_muted boolean not null default false,
  connection_status text not null check (connection_status in ('online', 'offline', 'unpaired')) default 'offline',
  current_level_db numeric(5,2) default -60.00,
  peak_level_db numeric(5,2) default -60.00,
  auto_mode boolean not null default true,
  safe_min_vol integer default 15,
  safe_max_vol integer default 85,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Microphones Table
create table if not exists public.microphones (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.rooms on delete cascade not null,
  zone_id uuid references public.zones on delete set null,
  name text not null, -- e.g. "MIC 01"
  description text,
  status text not null check (status in ('online', 'offline')) default 'offline',
  volume integer not null check (volume between 0 and 100) default 75,
  is_muted boolean not null default false,
  signal_level numeric(5,2) default 0,
  activity text not null check (activity in ('active', 'silent', 'inactive', 'clipping')) default 'silent',
  battery_percent integer check (battery_percent between 0 and 100),
  frequency_mhz text,
  last_activity_time timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Speakers Table
create table if not exists public.speakers (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.rooms on delete cascade not null,
  zone_id uuid references public.zones on delete cascade not null,
  name text not null,
  model text,
  status text not null check (status in ('online', 'offline', 'fault')) default 'offline',
  impedance_ohm integer default 8,
  max_wattage integer default 250,
  current_wattage integer default 0
);

-- 6. Audio Controllers Table (Hardware Registration)
create table if not exists public.controllers (
  id uuid default uuid_generate_v4() primary key,
  device_id text unique not null,
  token_hash text not null,
  room_id uuid references public.rooms on delete set null,
  name text not null,
  connection_status text not null check (connection_status in ('connected', 'disconnected', 'pending')) default 'disconnected',
  dsp_load_percent integer default 0,
  latency_ms numeric(5,2) default 0,
  firmware_version text default 'v1.0.0',
  ip_address text,
  last_seen timestamp with time zone default timezone('utc'::text, now())
);

-- 7. Audio Readings Table (High-frequency DSP telemetry)
create table if not exists public.audio_readings (
  id bigserial primary key,
  room_id uuid references public.rooms on delete cascade not null,
  zone_id uuid references public.zones on delete cascade,
  mic_id uuid references public.microphones on delete set null,
  rms_db numeric(5,2) not null,
  peak_db numeric(5,2) not null,
  is_clipping boolean default false,
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. AI Events Table (Acoustic decisions & suggestions)
create table if not exists public.ai_events (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.rooms on delete cascade not null,
  event_type text not null,
  severity text not null check (severity in ('info', 'warning', 'critical')),
  details jsonb not null default '{}'::jsonb,
  recommendation text not null,
  proposed_action text,
  proposed_value integer,
  is_applied boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Alerts Table
create table if not exists public.alerts (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.rooms on delete cascade not null,
  title text not null,
  message text not null,
  category text not null check (category in ('feedback', 'offline', 'mic_inactive', 'excessive_volume', 'ai_recommendation', 'controller_disconnected')),
  severity text not null check (severity in ('info', 'warning', 'critical')),
  resolved boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Audit Logs Table (Immutable compliance history)
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_email text not null,
  user_role text not null,
  operation text not null,
  room_name text not null,
  target_entity text not null,
  old_value text not null,
  new_value text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  source text not null check (source in ('Manual', 'AI'))
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.zones enable row level security;
alter table public.microphones enable row level security;
alter table public.speakers enable row level security;
alter table public.controllers enable row level security;
alter table public.audio_readings enable row level security;
alter table public.ai_events enable row level security;
alter table public.alerts enable row level security;
alter table public.audit_logs enable row level security;

-- Viewer Policy: Can read everything, cannot write
create policy "Authenticated users can view rooms" on public.rooms for select to authenticated using (true);
create policy "Authenticated users can view zones" on public.zones for select to authenticated using (true);
create policy "Authenticated users can view microphones" on public.microphones for select to authenticated using (true);
create policy "Authenticated users can view speakers" on public.speakers for select to authenticated using (true);
create policy "Authenticated users can view controllers" on public.controllers for select to authenticated using (true);
create table if not exists public.alerts; 
create policy "Authenticated users can view alerts" on public.alerts for select to authenticated using (true);
create policy "Authenticated users can view audit_logs" on public.audit_logs for select to authenticated using (true);

-- Operator & Admin Policy: Can update rooms, zones, microphones, alerts
create policy "Operators and Admins can update rooms" on public.rooms for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator')));

create policy "Operators and Admins can update zones" on public.zones for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator')));

create policy "Operators and Admins can update mics" on public.microphones for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator')));

-- Admin Only: Full modifications (insert/delete)
create policy "Admins have full control over rooms" on public.rooms for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins have full control over controllers" on public.controllers for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Audit log: Insert only (immutable)
create policy "Authenticated users can append audit logs" on public.audit_logs for insert to authenticated with check (true);
`;

export const SUPABASE_SCHEMA_SQL = SUPABASE_SQL_SCHEMA;
