-- Миграция: разрешить загрузку фото в бакет place-images всем (включая
-- гостей) — это нужно для фото, прикладываемых к форме "Предложить место",
-- которую может заполнить кто угодно, даже не входя в аккаунт.
--
-- ВАЖНО: я не вижу текущих политик твоего бакета Storage (это настраивается
-- отдельно от обычных таблиц и могло быть сделано вручную в Dashboard).
-- Если у бакета place-images уже была более строгая политика на INSERT —
-- эта миграция добавит ещё одну разрешающую политику (они складываются),
-- она не уберёт то, что было. Если что-то пойдёт не так — проверь
-- Storage → place-images → Policies в Supabase Dashboard глазами.
--
-- Как применить: Supabase Dashboard → SQL Editor → вставить целиком → Run.

drop policy if exists "Anyone can upload place images" on storage.objects;
create policy "Anyone can upload place images"
  on storage.objects for insert
  with check (bucket_id = 'place-images');

drop policy if exists "Anyone can view place images" on storage.objects;
create policy "Anyone can view place images"
  on storage.objects for select
  using (bucket_id = 'place-images');
