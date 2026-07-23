-- Миграция: блог со статьями.
-- Как применить: Supabase Dashboard → SQL Editor → вставить целиком → Run.

create table if not exists public.articles (
  id text primary key default gen_random_uuid()::text,
  author_id uuid references auth.users(id) on delete set null,
  title text not null,
  slug text not null unique,
  cover_image text,
  content text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.articles enable row level security;

-- Читать могут все опубликованные статьи; автор (админ) видит и черновики.
drop policy if exists "Anyone can read published articles" on public.articles;
create policy "Anyone can read published articles"
  on public.articles for select
  using (published = true or auth.uid() = author_id);

-- Писать может только администратор (единственный автор в этом приложении).
drop policy if exists "Admin can insert articles" on public.articles;
create policy "Admin can insert articles"
  on public.articles for insert
  with check ((auth.jwt() ->> 'email') = 'namiliya15@gmail.com');

drop policy if exists "Admin can update articles" on public.articles;
create policy "Admin can update articles"
  on public.articles for update
  using ((auth.jwt() ->> 'email') = 'namiliya15@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'namiliya15@gmail.com');

drop policy if exists "Admin can delete articles" on public.articles;
create policy "Admin can delete articles"
  on public.articles for delete
  using ((auth.jwt() ->> 'email') = 'namiliya15@gmail.com');
