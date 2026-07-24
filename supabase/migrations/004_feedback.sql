-- Миграция: обратная связь от пользователей.
-- Как применить: Supabase Dashboard → SQL Editor → вставить целиком → Run.

create table if not exists public.place_suggestions (
  id text primary key default gen_random_uuid()::text,
  submitted_by uuid references auth.users(id) on delete set null,
  submitted_email text,
  name text not null,
  chinese_name text,
  chinese_address text,
  category text,
  description text,
  working_hours text,
  price_info text,
  extra_info text,
  photos text,
  lat double precision,
  lng double precision,
  note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.place_reports (
  id text primary key default gen_random_uuid()::text,
  place_id text references public.places(id) on delete cascade,
  submitted_by uuid references auth.users(id) on delete set null,
  submitted_email text,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  admin_reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.place_suggestions enable row level security;
alter table public.place_reports enable row level security;

-- Отправлять может кто угодно (даже гость) — привязываем к пользователю,
-- только если он вошёл в аккаунт.
drop policy if exists "Anyone can submit a place suggestion" on public.place_suggestions;
create policy "Anyone can submit a place suggestion"
  on public.place_suggestions for insert
  with check (submitted_by is null or submitted_by = auth.uid());

drop policy if exists "Anyone can submit a place report" on public.place_reports;
create policy "Anyone can submit a place report"
  on public.place_reports for insert
  with check (submitted_by is null or submitted_by = auth.uid());

-- Читать: администратор видит всё, авторизованный автор — только своё
-- (чтобы показать статус и ответ на странице "Мои предложения").
drop policy if exists "Admin or author can read suggestions" on public.place_suggestions;
create policy "Admin or author can read suggestions"
  on public.place_suggestions for select
  using ((auth.jwt() ->> 'email') = 'namiliya15@gmail.com' or submitted_by = auth.uid());

drop policy if exists "Admin or author can read reports" on public.place_reports;
create policy "Admin or author can read reports"
  on public.place_reports for select
  using ((auth.jwt() ->> 'email') = 'namiliya15@gmail.com' or submitted_by = auth.uid());

-- Менять статус/отвечать может только администратор.
drop policy if exists "Admin can update suggestions" on public.place_suggestions;
create policy "Admin can update suggestions"
  on public.place_suggestions for update
  using ((auth.jwt() ->> 'email') = 'namiliya15@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'namiliya15@gmail.com');

drop policy if exists "Admin can update reports" on public.place_reports;
create policy "Admin can update reports"
  on public.place_reports for update
  using ((auth.jwt() ->> 'email') = 'namiliya15@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'namiliya15@gmail.com');

drop policy if exists "Admin can delete suggestions" on public.place_suggestions;
create policy "Admin can delete suggestions"
  on public.place_suggestions for delete
  using ((auth.jwt() ->> 'email') = 'namiliya15@gmail.com');

drop policy if exists "Admin can delete reports" on public.place_reports;
create policy "Admin can delete reports"
  on public.place_reports for delete
  using ((auth.jwt() ->> 'email') = 'namiliya15@gmail.com');
