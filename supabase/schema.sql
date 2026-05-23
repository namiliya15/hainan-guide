create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  category_order text[] not null default array[
    'Избранное',
    'Рестораны и кафе',
    'Отели',
    'Парки',
    'Пляжи',
    'Достопримечательности',
    'Интересные места',
    'Торговые центры',
    'Магазины'
  ],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.places (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  chinese_name text,
  chinese_address text,
  category text not null,
  description text,
  photo_url text not null,
  lat double precision not null,
  lng double precision not null,
  amap_url text,
  trip_url text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id text not null references public.places(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

alter table public.profiles enable row level security;
alter table public.places enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can upsert own profile" on public.profiles;
create policy "Users can upsert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Anyone can read public places" on public.places;
create policy "Anyone can read public places"
  on public.places for select
  using (is_public = true or auth.uid() = user_id);

drop policy if exists "Users can insert own places" on public.places;
create policy "Users can insert own places"
  on public.places for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own places" on public.places;
create policy "Users can update own places"
  on public.places for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own places" on public.places;
create policy "Users can delete own places"
  on public.places for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read own favorites" on public.favorites;
create policy "Users can read own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

drop policy if exists "Users can add own favorites" on public.favorites;
create policy "Users can add own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own favorites" on public.favorites;
create policy "Users can delete own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Стартовые места (уже удалены из кода, но на всякий случай оставляем пустой вставкой)
-- Можно оставить как есть или удалить — они не добавятся, так как is_public = true,
-- но если хотите чистый старт, удалите этот блок.
