-- Миграция: исправление прав на редактирование мест.
--
-- Проблема: политики ниже разрешали изменять/удалять место только если
-- auth.uid() совпадает с user_id, записанным в конкретной строке. Для мест,
-- добавленных раньше (или там, где user_id не совпал по любой причине),
-- обновление молча не применялось — RLS просто не находит ни одной строки
-- под условие, Supabase не считает это ошибкой. Поэтому не сохранялись ни
-- новые фото, ни перетаскивание метки на карте, ни удаление таких мест —
-- без единого сообщения об ошибке в интерфейсе.
--
-- Исправление: права привязаны к email администратора (как уже сделано
-- для statей и предложений мест), а не к user_id конкретной записи —
-- это надёжнее для приложения с одним админом.
--
-- Как применить: Supabase Dashboard → SQL Editor → вставить целиком → Run.

drop policy if exists "Users can insert own places" on public.places;
drop policy if exists "Admin can insert places" on public.places;
create policy "Admin can insert places"
  on public.places for insert
  with check ((auth.jwt() ->> 'email') = 'namiliya15@gmail.com');

drop policy if exists "Users can update own places" on public.places;
drop policy if exists "Admin can update places" on public.places;
create policy "Admin can update places"
  on public.places for update
  using ((auth.jwt() ->> 'email') = 'namiliya15@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'namiliya15@gmail.com');

drop policy if exists "Users can delete own places" on public.places;
drop policy if exists "Admin can delete places" on public.places;
create policy "Admin can delete places"
  on public.places for delete
  using ((auth.jwt() ->> 'email') = 'namiliya15@gmail.com');

-- На всякий случай подчищаем старые записи, где user_id мог быть пустым
-- или не совпадать ни с одним реальным пользователем — простановка
-- значения не обязательна для работы (доступ теперь не завязан на это
-- поле), но приводит данные в порядок.
-- Раскомментируй и подставь свой ID, если хочешь — но это необязательно:
-- update public.places set user_id = 'ТВОЙ_USER_ID' where user_id is null;
