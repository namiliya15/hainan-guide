-- Миграция: расширенное описание места + исправления схемы.
--
-- ВАЖНО про находку: в исходной схеме (schema.sql) поле `photo_url` было
-- NOT NULL, а `lat`/`lng` тоже NOT NULL — но код приложения (и старый, и
-- новый) пишет в поле `photos` (которого в таблице вообще не было) и
-- допускает место без координат (lat/lng = null, "добавлено по клику
-- на карте, координаты потом"). Если это не было поправлено вручную
-- раньше прямо в Supabase — добавление места без фото по URL или без
-- координат должно было падать с ошибкой NOT NULL constraint.
-- Эта миграция чинит это заодно с добавлением новых полей.
--
-- Как применить: Supabase Dashboard → SQL Editor → вставить целиком → Run.
-- Миграция безопасна для повторного запуска (IF NOT EXISTS / проверки).

alter table public.places add column if not exists photos text;
alter table public.places add column if not exists working_hours text;
alter table public.places add column if not exists price_info text;
alter table public.places add column if not exists extra_info text;

alter table public.places alter column photo_url drop not null;
alter table public.places alter column lat drop not null;
alter table public.places alter column lng drop not null;
