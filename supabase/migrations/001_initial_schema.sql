-- =============================================
-- LUNA HEALTH — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- PROFILES
-- =============================================
create table if not exists public.profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text not null default '',
  age integer,
  gender text check (gender in ('male', 'female', 'other')),
  height_cm numeric(5,1),
  weight_kg numeric(5,1),
  activity_level text check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  medical_history text,
  goals text,
  avatar_url text,
  telegram_chat_id text,
  telegram_username text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- UPLOADS
-- =============================================
create table if not exists public.uploads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  file_url text not null,
  file_name text not null,
  file_type text check (file_type in ('pdf', 'image', 'other')) not null,
  upload_source text check (upload_source in ('web', 'telegram')) not null default 'web',
  status text check (status in ('pending', 'processing', 'completed', 'failed')) not null default 'pending',
  created_at timestamptz default now()
);

-- =============================================
-- OCR RESULTS
-- =============================================
create table if not exists public.ocr_results (
  id uuid default uuid_generate_v4() primary key,
  upload_id uuid references public.uploads(id) on delete cascade not null,
  raw_text text not null,
  processing_status text check (processing_status in ('pending', 'done', 'failed')) default 'done',
  created_at timestamptz default now()
);

-- =============================================
-- BIOMARKERS
-- =============================================
create table if not exists public.biomarkers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  upload_id uuid references public.uploads(id) on delete set null,
  marker_name text not null,
  value numeric not null,
  unit text not null,
  ref_range_low numeric,
  ref_range_high numeric,
  status text check (status in ('low', 'normal', 'high', 'unknown')) default 'unknown',
  test_date date,
  created_at timestamptz default now()
);

-- =============================================
-- ANTHROPOMETRIC DATA
-- =============================================
create table if not exists public.anthropometric_data (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  height_cm numeric(5,1),
  weight_kg numeric(5,1),
  bmi numeric(4,1),
  body_fat_pct numeric(4,1),
  waist_cm numeric(5,1),
  hip_cm numeric(5,1),
  measurement_date date not null default current_date,
  created_at timestamptz default now()
);

-- =============================================
-- WEARABLE METRICS
-- =============================================
create table if not exists public.wearable_metrics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  resting_hr integer,
  max_hr integer,
  hrv_ms integer,
  sleep_hours numeric(4,1),
  sleep_score integer,
  recovery_score integer,
  activity_score integer,
  steps integer,
  spo2 numeric(4,1),
  skin_temp_c numeric(4,1),
  stress_score integer,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- =============================================
-- WEEKLY SUMMARIES
-- =============================================
create table if not exists public.weekly_summaries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  week_start_date date not null,
  overall_score integer,
  health_summary text not null,
  training_guidance text not null,
  recovery_guidance text not null,
  sleep_guidance text not null,
  nutrition_guidance text not null,
  msk_implications text not null,
  doctor_consultation_needed boolean default false,
  doctor_reason text,
  prev_week_comparison text,
  sent_telegram boolean default false,
  created_at timestamptz default now(),
  unique(user_id, week_start_date)
);

-- =============================================
-- NOTIFICATION LOGS
-- =============================================
create table if not exists public.notification_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null,
  channel text check (channel in ('telegram', 'email', 'web')) not null,
  message_preview text,
  status text check (status in ('sent', 'failed', 'pending')) not null,
  sent_at timestamptz default now()
);

-- =============================================
-- ADMIN AUDIT
-- =============================================
create table if not exists public.admin_audit (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

alter table public.profiles enable row level security;
alter table public.uploads enable row level security;
alter table public.ocr_results enable row level security;
alter table public.biomarkers enable row level security;
alter table public.anthropometric_data enable row level security;
alter table public.wearable_metrics enable row level security;
alter table public.weekly_summaries enable row level security;
alter table public.notification_logs enable row level security;

-- Profiles: user can only see/edit their own
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = user_id);

-- Uploads
create policy "Users can view own uploads" on public.uploads for select using (auth.uid() = user_id);
create policy "Users can insert own uploads" on public.uploads for insert with check (auth.uid() = user_id);

-- OCR results (via upload)
create policy "Users can view own ocr results" on public.ocr_results for select
  using (exists (select 1 from public.uploads where uploads.id = ocr_results.upload_id and uploads.user_id = auth.uid()));

-- Biomarkers
create policy "Users can view own biomarkers" on public.biomarkers for select using (auth.uid() = user_id);
create policy "Users can insert own biomarkers" on public.biomarkers for insert with check (auth.uid() = user_id);

-- Anthropometric
create policy "Users can view own anthropometric" on public.anthropometric_data for select using (auth.uid() = user_id);
create policy "Users can insert own anthropometric" on public.anthropometric_data for insert with check (auth.uid() = user_id);

-- Wearable
create policy "Users can view own wearable" on public.wearable_metrics for select using (auth.uid() = user_id);
create policy "Users can insert own wearable" on public.wearable_metrics for insert with check (auth.uid() = user_id);
create policy "Users can update own wearable" on public.wearable_metrics for update using (auth.uid() = user_id);

-- Weekly summaries
create policy "Users can view own summaries" on public.weekly_summaries for select using (auth.uid() = user_id);

-- Notification logs
create policy "Users can view own notifications" on public.notification_logs for select using (auth.uid() = user_id);

-- =============================================
-- STORAGE BUCKET
-- =============================================
-- Run this separately if needed:
-- insert into storage.buckets (id, name, public) values ('health-reports', 'health-reports', true);
-- create policy "Users can upload to own folder" on storage.objects for insert with check (bucket_id = 'health-reports' and auth.uid()::text = (storage.foldername(name))[1]);
-- create policy "Anyone can view health reports" on storage.objects for select using (bucket_id = 'health-reports');

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
