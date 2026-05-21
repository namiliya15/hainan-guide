# Инструкция по ручному деплою

Эта инструкция нужна, если окружение Codex не может самостоятельно создать GitHub/Supabase/Vercel-проекты из-за отсутствия авторизованных аккаунтов, captcha, 2FA или CLI-инструментов.

## 1. Установить зависимости и проверить локально

В папке проекта выполни:

```bash
npm install
npm run dev
```

Открой локальный URL, который покажет Vite, обычно:

```text
http://localhost:5173
```

Пока Supabase не настроен, приложение откроется в локальном demo-режиме.

## 2. Создать проект Supabase

1. Перейди на `https://supabase.com/dashboard`.
2. Создай проект с названием `hainan-guide`.
3. Дождись завершения создания проекта.
4. Открой SQL Editor.
5. Вставь полный SQL из файла `supabase/schema.sql`.
6. Нажми Run.

Скрипт создаст:

- `profiles`
- `places`
- `favorites`
- RLS-политики
- trigger для создания профиля нового пользователя
- 15 стартовых мест по Дадунхаю и Санье

## 3. Получить ключи Supabase

В Supabase открой Project Settings > API и скопируй:

- Project URL
- anon public key

В файле `.env` замени placeholders:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Пример:

```bash
VITE_SUPABASE_URL=https://abcdefghijklm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

`anon public key` можно использовать во frontend-приложении. Service role key сюда вставлять нельзя.

## 4. Загрузить проект в GitHub

Создай пустой репозиторий, например:

```text
hainan-guide
```

Затем в папке проекта выполни:

```bash
git init
git add .
git commit -m "Build Hainan guide PWA"
git branch -M main
git remote add origin https://github.com/YOUR_USER/hainan-guide.git
git push -u origin main
```

## 5. Задеплоить на Vercel

1. Открой `https://vercel.com/new`.
2. Выбери GitHub-репозиторий `hainan-guide`.
3. Укажи настройки:

```text
Framework Preset: Vite
Build command: npm run build
Output directory: dist
```

4. Добавь Environment Variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

5. Нажми Deploy.

## 6. Проверить приложение

После деплоя:

1. Открой Vercel URL.
2. Зарегистрируй пользователя.
3. Подтверди email, если Supabase этого требует.
4. Войди в приложение.
5. Проверь карточки мест.
6. Проверь `Open in Amap`.
7. Нажми `Show on map`.
8. Перетащи категории и обнови страницу.
9. Добавь новое место через форму.
10. Добавь новое место кликом по карте.
11. Проверь избранное.
12. Проверь PWA:

```text
Chrome DevTools > Application > Manifest
Chrome DevTools > Application > Service Workers
```

## 7. Как установить PWA

Android:

1. Открой live URL в Chrome.
2. Нажми меню с тремя точками.
3. Выбери `Install app` или `Add to Home screen`.

iOS:

1. Открой live URL в Safari.
2. Нажми Share.
3. Выбери `Add to Home Screen`.

## 8. Если хочешь, чтобы Codex настроил все сам

Я смогу продолжить настройку самостоятельно, если у меня будет рабочий способ авторизоваться и выполнить действия без captcha/2FA-блокировки.

Лучший вариант:

- ты заранее создаешь или авторизуешь временные аккаунты GitHub, Supabase и Vercel в браузере;
- либо даешь временные токены/доступы с минимальными правами;
- после завершения деплоя ты отзываешь токены или меняешь пароли.

Что может потребоваться:

- GitHub: доступ к репозиторию или GitHub token с правом создать/запушить репозиторий.
- Supabase: доступ к проекту или Supabase access token, чтобы создать проект и выполнить SQL.
- Vercel: доступ к аккаунту/проекту или Vercel token, чтобы импортировать репозиторий, добавить env vars и задеплоить.

Пароли от основных личных аккаунтов лучше не передавать. Безопаснее использовать временный аккаунт, временный token или уже открытую авторизованную сессию в браузере.
