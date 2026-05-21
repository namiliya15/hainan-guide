create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  category_order text[] not null default array[
    'Favorites',
    'Restaurants & Cafes',
    'Hotels',
    'Parks',
    'Beaches',
    'Attractions',
    'Interesting places',
    'Shopping malls',
    'Shops'
  ],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.places (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  chinese_name text,
  category text not null,
  description text not null,
  photo_url text not null,
  lat double precision not null,
  lng double precision not null,
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

insert into public.places (id, name, chinese_name, category, description, photo_url, lat, lng, is_public)
values
('sample-dadonghai-beach','Dadonghai Beach','大东海旅游区','Beaches','Wide public beach with warm water, rental loungers, evening lights, and quick access to restaurants along Yuya Road.','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',18.2199,109.5147,true),
('sample-luhuitou','Luhuitou Scenic Area','鹿回头风景区','Attractions','Hilltop viewpoint above Sanya Bay and Dadonghai, best near sunset when the city lights begin to glow.','https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',18.2206,109.4987,true),
('sample-pineapple-mall','Pineapple Shopping Center','大菠萝购物中心','Shopping malls','Landmark pineapple-shaped mall with restaurants, coffee, groceries, and useful rainy-day browsing.','https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1200&q=80',18.2243,109.5167,true),
('sample-summer-mall','Summer Mall','夏日百货','Shopping malls','Compact department store and dining stop near Dadonghai, convenient for basics, snacks, and air conditioning.','https://images.unsplash.com/photo-1521337581100-8ca9a73a5f79?auto=format&fit=crop&w=1200&q=80',18.2232,109.5133,true),
('sample-dolphin','Dolphin Sports Bar & Grill','海豚西餐酒吧','Restaurants & Cafes','Reliable international menu, drinks, and screens for sports nights close to the beach.','https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80',18.2235,109.5147,true),
('sample-starbucks','Starbucks Dadonghai','星巴克 大东海店','Restaurants & Cafes','Familiar coffee stop with predictable Wi-Fi, cold drinks, and a good base before exploring the bay.','https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',18.2241,109.5154,true),
('sample-marriott','JW Marriott Hotel Sanya Dadonghai Bay','三亚山海天JW万豪酒店','Hotels','Upscale resort hotel between Dadonghai and Luhuitou with sea views and quick taxi access to the beach.','https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',18.2166,109.5069,true),
('sample-mandarin','Mandarin Oriental Sanya','三亚文华东方酒店','Hotels','Quiet luxury resort on a rocky private-feeling coastline east of Dadonghai, excellent for a splurge meal or spa day.','https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',18.2186,109.5346,true),
('sample-yuya-road','Yuya Road Evening Walk','榆亚路夜游','Interesting places','Lively corridor for neon signs, fruit shops, barbecue scents, scooter traffic, and casual people watching.','https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=80',18.226,109.5152,true),
('sample-xiaodonghai','Xiaodonghai Coast','小东海','Beaches','Rockier, quieter shoreline west of Dadonghai with tide pools, fishing views, and fewer crowds.','https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',18.2098,109.5007,true),
('sample-banshan','Banshan Peninsula Sailing Port','半山半岛帆船港','Attractions','Marina with yacht views, calm promenades, and photo-friendly angles back toward Sanya.','https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1200&q=80',18.2086,109.4941,true),
('sample-dadonghai-square','Dadonghai Square','大东海广场','Interesting places','Open plaza by the beach with evening dancers, families, snack stalls, and easy meeting points.','https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',18.2208,109.5161,true),
('sample-linchunling','Linchunling Forest Park','临春岭森林公园','Parks','Urban forest park with stairs, lookout pavilions, and a rewarding panorama over central Sanya.','https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',18.2614,109.5123,true),
('sample-fruit-shop','Dadonghai Fruit Shops','大东海水果店','Shops','Neighborhood fruit stands for mango, dragon fruit, coconuts, and passion fruit. Compare prices before buying.','https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1200&q=80',18.2252,109.5177,true),
('sample-duty-free','Sanya International Duty Free City','三亚国际免税城','Shopping malls','Large duty-free complex in Haitang Bay for luxury shopping; farther from Dadonghai but a common day trip.','https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=1200&q=80',18.3036,109.7332,true)
on conflict (id) do update set
  name = excluded.name,
  chinese_name = excluded.chinese_name,
  category = excluded.category,
  description = excluded.description,
  photo_url = excluded.photo_url,
  lat = excluded.lat,
  lng = excluded.lng,
  is_public = excluded.is_public,
  updated_at = now();
