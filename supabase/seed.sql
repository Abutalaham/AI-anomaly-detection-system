-- Sentinel Initial Seed Data: supabase/seed.sql

-- Insert baseline demo streams if auth user exists, or as unassigned demo templates
-- Note: When users sign up, demo streams can be linked or run via DemoStreamRepository
-- Server Latency (ms), Factory Vibration Sensor (mm/s), Payment Amount (INR)

insert into public.streams (id, user_id, name, unit, kind, config)
select
  'demo-stream-latency',
  id,
  'Server Latency',
  'ms',
  'latency',
  '{"window": 60, "zThreshold": 3.0, "ewmaLambda": 0.2, "cooldownSec": 30}'::jsonb
from auth.users
limit 1
on conflict (id) do nothing;

insert into public.streams (id, user_id, name, unit, kind, config)
select
  'demo-stream-vibration',
  id,
  'Factory Vibration Sensor',
  'mm/s',
  'vibration',
  '{"window": 60, "zThreshold": 2.5, "ewmaLambda": 0.15, "cooldownSec": 20}'::jsonb
from auth.users
limit 1
on conflict (id) do nothing;

insert into public.streams (id, user_id, name, unit, kind, config)
select
  'demo-stream-payment',
  id,
  'Payment Processing Amount',
  'INR',
  'payment',
  '{"window": 60, "zThreshold": 3.5, "ewmaLambda": 0.25, "cooldownSec": 45}'::jsonb
from auth.users
limit 1
on conflict (id) do nothing;
