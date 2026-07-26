-- Миграция: ответ пользователя администратору.
-- Как применить: Supabase Dashboard → SQL Editor → вставить целиком → Run.

alter table public.place_suggestions add column if not exists user_reply text;
alter table public.place_suggestions add column if not exists user_reply_seen boolean not null default true;

alter table public.place_reports add column if not exists user_reply text;
alter table public.place_reports add column if not exists user_reply_seen boolean not null default true;

-- Политики на обновление своей записи (submitted_by = auth.uid()) уже были
-- добавлены в 005_reply_notifications.sql — этого достаточно, чтобы
-- пользователь мог записать user_reply в свою же заявку.
