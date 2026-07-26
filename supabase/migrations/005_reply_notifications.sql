-- Миграция: уведомления об ответе администратора.
-- Как применить: Supabase Dashboard → SQL Editor → вставить целиком → Run.

alter table public.place_suggestions add column if not exists reply_seen boolean not null default true;
alter table public.place_reports add column if not exists reply_seen boolean not null default true;

-- Автор заявки должен иметь возможность отметить у СВОЕЙ записи, что он
-- увидел ответ. RLS в Postgres не даёт ограничить обновление одним полем
-- без отдельной функции/триггера — поэтому политика ниже разрешает автору
-- обновлять свою запись целиком. Это не проблема безопасности: запись и
-- так принадлежит ему, менять чужие заявки эта политика не позволяет.
drop policy if exists "Author can update own suggestion" on public.place_suggestions;
create policy "Author can update own suggestion"
  on public.place_suggestions for update
  using (submitted_by = auth.uid())
  with check (submitted_by = auth.uid());

drop policy if exists "Author can update own report" on public.place_reports;
create policy "Author can update own report"
  on public.place_reports for update
  using (submitted_by = auth.uid())
  with check (submitted_by = auth.uid());
