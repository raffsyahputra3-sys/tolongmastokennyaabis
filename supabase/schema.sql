-- ============================================================================
-- GatraVolt — skema akun pemain di Supabase
-- PRD: PRD-LOGIN.md
--
-- Cara pakai:
--   1. Buat proyek di https://supabase.com
--   2. Buka SQL Editor → tempel seluruh isi berkas ini → Run
--   3. Salin Project URL dan anon key (Settings → API)
--   4. Isi keduanya sebagai environment variable server game (lihat render.yaml):
--        SUPABASE_URL, SUPABASE_ANON_KEY
--      Opsional: SUPABASE_SERVICE_ROLE_KEY (jalur cadangan hapus/ekspor),
--                SUPABASE_JWT_SECRET (hanya bila proyek memakai penandatanganan HS256)
--
-- Etika/prinsip: hanya menyimpan data minimal (email + nama tampilan + progres),
-- RLS membatasi setiap akun hanya pada barisnya sendiri, hapus akun = cascade.
-- ============================================================================

-- 1. Profil pemain (1:1 dengan auth.users) -----------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 24),
  skill_level int not null default 1 check (skill_level between 1 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Progres latihan harian (sinkron lintas perangkat) ----------------------
create table if not exists public.daily_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 3. Row Level Security: setiap akun hanya menyentuh barisnya sendiri --------
alter table public.profiles enable row level security;
alter table public.daily_progress enable row level security;

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles self insert" on public.profiles;
create policy "profiles self insert" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "daily self all" on public.daily_progress;
create policy "daily self all" on public.daily_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. Buat baris profil otomatis saat pendaftaran ----------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 24), ''), 'Pemain')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Hapus akun sendiri (hak pengguna) --------------------------------------
-- Cukup dengan anon key + sesi login: fungsi ini hanya menghapus akun pemanggil.
-- Cascade ikut menghapus profiles & daily_progress (lihat foreign key di atas).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;

-- 6. Pemeriksaan cepat: hanya baris milik sendiri yang terlihat -------------
-- (jalankan setelah login lewat aplikasi; sebagai anon harus mengembalikan 0 baris)
-- select id, display_name from public.profiles;
