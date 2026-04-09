-- Create proper RLS policies and tables for Strategic Study Tracker

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. Fields Table
-- ==========================================
create table public.fields (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Fields
alter table public.fields enable row level security;

create policy "Users can view their own fields"
  on public.fields for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own fields"
  on public.fields for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own fields"
  on public.fields for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own fields"
  on public.fields for delete
  using ( auth.uid() = user_id );


-- ==========================================
-- 2. Materials Table
-- ==========================================
create table public.materials (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  field_id uuid references public.fields(id) on delete cascade not null,
  title text not null,
  type text not null check (type in ('TEXTBOOK', 'MOVIE')),
  cover_url text,      -- Supabase Storage link to thumbnail
  pdf_path text,       -- Supabase Storage path/link to the actual material
  total_pages integer default 0,
  current_page integer default 1,
  scroll_ratio double precision default 0,
  progress double precision default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Materials
alter table public.materials enable row level security;

create policy "Users can view their own materials"
  on public.materials for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own materials"
  on public.materials for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own materials"
  on public.materials for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own materials"
  on public.materials for delete
  using ( auth.uid() = user_id );


-- ==========================================
-- 3. Annotations Table (for future/lightweight strokes)
-- ==========================================
create table public.annotations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  material_id uuid references public.materials(id) on delete cascade not null,
  page_number integer not null,
  type text not null check (type in ('highlight', 'note', 'stroke')),
  data jsonb not null, -- Stores normalized coordinates (0-1) for strokes
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Annotations
alter table public.annotations enable row level security;

create policy "Users can view their own annotations"
  on public.annotations for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own annotations"
  on public.annotations for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own annotations"
  on public.annotations for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own annotations"
  on public.annotations for delete
  using ( auth.uid() = user_id );

-- Create updated_at trigger for annotations
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on public.annotations
for each row
execute procedure public.handle_updated_at();

-- ==========================================
-- Supabase Storage Buckets Setup
-- ==========================================
-- 1. Create a bucket named 'materials' in the Storage dashboard.
-- 2. Run the following SQL to set up folder-based isolation:

CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'materials' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow authenticated select"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'materials' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow individual update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'materials' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow individual delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'materials' AND
    (storage.foldername(name))[1] = auth.uid()::text
);


-- ==========================================
-- 5. User Settings Table (個人設定・APIキー管理)
-- ==========================================
-- SupabaseのSQL Editorで以下を実行してください
create table if not exists public.user_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  gemini_api_key text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_settings enable row level security;

create policy "Users can view their own settings"
  on public.user_settings for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own settings"
  on public.user_settings for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own settings"
  on public.user_settings for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own settings"
  on public.user_settings for delete
  using ( auth.uid() = user_id );
