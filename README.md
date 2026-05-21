# Hainan Guide

PWA-гид по Хайнаню, сфокусированный на Санье и районе Дадунхай. Стек: React + Vite + TailwindCSS + Supabase + Leaflet + `@dnd-kit`.

## Возможности

- Авторизация через Supabase по email/паролю.
- Карточки мест: фото, категория, описание, китайское название, кнопки `Open in Amap` и `Show on map`.
- Перетаскиваемое меню категорий, порядок сохраняется для каждого пользователя.
- Добавление своих мест: название, китайское название, категория, URL фото, описание, широта и долгота.
- Общая карта Leaflet со всеми местами.
- Добавление места кликом по карте.
- Избранное.
- PWA: manifest и service worker для офлайн-доступа к оболочке приложения.
- Локальный demo-режим, если переменные Supabase еще не настроены.

## Локальный запуск

```bash
npm install
cp .env.example .env
npm run dev
```

После создания проекта Supabase укажи реальные значения в `.env`:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## Настройка Supabase

1. Открой `https://supabase.com/dashboard`.
2. Создай новый проект с названием `hainan-guide`.
3. Открой SQL Editor.
4. Скопируй содержимое файла [`supabase/schema.sql`](./supabase/schema.sql).
5. Выполни SQL-скрипт.
6. В разделе Authentication > Providers оставь включенной авторизацию по Email.
7. В Project Settings > API скопируй:
   - Project URL
   - anon public key
8. Вставь эти значения в `.env` и в переменные окружения на Vercel.

## Деплой на Vercel

1. Загрузи проект в GitHub-репозиторий.
2. Открой `https://vercel.com/new`.
3. Импортируй репозиторий.
4. Framework Preset: `Vite`.
5. Build command: `npm run build`.
6. Output directory: `dist`.
7. Добавь переменные окружения:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
8. Нажми Deploy.

## Установка как PWA

- Android Chrome: открой опубликованный URL, нажми меню с тремя точками, затем `Add to Home screen` или `Install app`.
- iOS Safari: открой опубликованный URL, нажми Share, затем `Add to Home Screen`.

## Проверка после деплоя

1. Открой live URL.
2. Зарегистрируй пользователя по email/паролю.
3. Если в Supabase включено подтверждение email, подтверди письмо.
4. Войди в приложение.
5. Перетащи категории в меню, обнови страницу и проверь, что порядок сохранился.
6. Добавь место через кнопку `Add`.
7. Кликни по карте и проверь, что форма добавления открылась с координатами.
8. Добавь и убери место из избранного.
9. Проверь, что `Open in Amap` открывает ссылку на Amap.
10. В браузере открой DevTools > Application > Service Workers и проверь, что `sw.js` активен.
