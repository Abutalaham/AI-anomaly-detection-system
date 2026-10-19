-- Sentinel Database Schema Migration: 20261015000000_init_sentinel_schema.sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  created_at timestamptz default now() not null
);

-- Automatic Profile Creation Trigger on auth.users insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Streams Table
create table if not exists public.streams (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  unit text not null,
  kind text not null check (kind in ('latency', 'vibration', 'payment')),
  config jsonb not null default '{"window": 60, "zThreshold": 3.0, "ewmaLambda": 0.2, "cooldownSec": 30}'::jsonb,
  created_at timestamptz default now() not null
);

-- 3. Readings Table
create table if not exists public.readings (
  id bigint generated always as identity primary key,
  stream_id text not null references public.streams(id) on delete cascade,
  ts timestamptz not null default now(),
  value double precision not null,
  score double precision not null default 0,
  is_anomaly boolean not null default false
);

-- Performance Index for High-Throughput Stream Lookups
create index if not exists idx_readings_stream_ts on public.readings (stream_id, ts desc);

-- Retention Pruning: Keep latest 5,000 readings per stream
create or replace function public.prune_old_readings()
returns trigger as $$
declare
  row_count integer;
begin
  select count(*) into row_count from public.readings where stream_id = new.stream_id;
  if row_count > 5050 then
    delete from public.readings
    where id in (
      select id from public.readings
      where stream_id = new.stream_id
      order by ts asc
      limit (row_count - 5000)
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_reading_inserted on public.readings;
create trigger on_reading_inserted
  after insert on public.readings
  for each row execute procedure public.prune_old_readings();

-- 4. Alerts Table
create table if not exists public.alerts (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users on delete cascade not null,
  stream_id text not null references public.streams(id) on delete cascade,
  reading_id bigint references public.readings(id) on delete set null,
  ts timestamptz not null default now(),
  severity text not null check (severity in ('info', 'warning', 'critical')),
  type text not null,
  score double precision not null,
  evidence jsonb not null default '{}'::jsonb,
  explanation text not null,
  explanation_source text not null check (explanation_source in ('ai', 'template')),
  status text not null default 'open' check (status in ('open', 'acknowledged', 'resolved')),
  acknowledged_at timestamptz
);

create index if not exists idx_alerts_user_status on public.alerts (user_id, status, ts desc);

-- Enable Row Level Security (RLS) across all tables
alter table public.profiles enable row level security;
alter table public.streams enable row level security;
alter table public.readings enable row level security;
alter table public.alerts enable row level security;

-- Profiles Policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Streams Policies
create policy "Users can view own streams"
  on public.streams for select
  using (auth.uid() = user_id);

create policy "Users can insert own streams"
  on public.streams for insert
  with check (auth.uid() = user_id);

create policy "Users can update own streams"
  on public.streams for update
  using (auth.uid() = user_id);

create policy "Users can delete own streams"
  on public.streams for delete
  using (auth.uid() = user_id);

-- Readings Policies
create policy "Users can view readings of own streams"
  on public.readings for select
  using (
    exists (
      select 1 from public.streams
      where public.streams.id = public.readings.stream_id
      and public.streams.user_id = auth.uid()
    )
  );

create policy "Users can insert readings to own streams"
  on public.readings for insert
  with check (
    exists (
      select 1 from public.streams
      where public.streams.id = public.readings.stream_id
      and public.streams.user_id = auth.uid()
    )
  );

-- Alerts Policies
create policy "Users can view own alerts"
  on public.alerts for select
  using (auth.uid() = user_id);

create policy "Users can update own alerts"
  on public.alerts for update
  using (auth.uid() = user_id);

-- Realtime Publication for live telemetry streaming
alter publication supabase_realtime add table public.readings;
alter publication supabase_realtime add table public.alerts;
