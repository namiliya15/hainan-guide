import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu, Plus, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { defaultCategories } from '../data/categories';

export function Navbar({ session, isAdmin, theme, onToggleTheme, onSignOut, onOpenAuth, onAddPlace }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Закрываем бургер-меню при переходе на другую страницу/категорию
  useEffect(() => setMenuOpen(false), [location.pathname, location.search]);

  return (
    <nav className="sticky top-0 z-40 border-b border-sand-300 bg-sand/85 backdrop-blur dark:border-night-surface2 dark:bg-night/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <svg className="h-8 w-8 shrink-0 text-lagoon dark:text-aqua" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 44C24 44 24 30 24 22C24 14 18 8 8 8C8 8 10 20 18 24C22 26 24 30 24 34" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M24 22C24 14 30 8 40 8C40 8 38 20 30 24C26 26 24 28 24 28" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M24 22C24 15 22 10 16 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M24 22C24 15 26 10 32 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          <span className="truncate font-display text-[17px] font-semibold text-ink dark:text-white">Хайнань гид</span>
        </Link>

        {/* ---------- Десктоп ---------- */}
        <div className="hidden items-center gap-1.5 sm:flex sm:gap-2">
          <Link
            to="/articles"
            className="rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-sand-200 hover:text-ink dark:text-mist dark:hover:bg-night-surface2 dark:hover:text-white"
          >
            Статьи о путешествиях
          </Link>

          {isAdmin && (
            <button
              type="button"
              onClick={onAddPlace}
              className="inline-flex items-center gap-1.5 rounded-full bg-coral px-3.5 py-2 text-sm font-bold text-white hover:bg-coral-600"
            >
              <Plus size={15} />
              Добавить место
            </button>
          )}

          {session ? (
            <button
              type="button"
              onClick={onSignOut}
              className="grid h-10 w-10 place-items-center rounded-full border border-sand-300 text-slate-600 hover:bg-sand-200 dark:border-night-surface2 dark:text-mist dark:hover:bg-night-surface2"
              aria-label="Выйти"
              title={session.user?.email}
            >
              <LogOut size={17} />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onOpenAuth('signIn')}
                className="rounded-full px-3.5 py-2 text-sm font-semibold text-ink hover:bg-sand-200 dark:text-white dark:hover:bg-night-surface2"
              >
                Войти
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('signUp')}
                className="rounded-full bg-lagoon px-3.5 py-2 text-sm font-bold text-white hover:bg-lagoon-600 dark:bg-aqua dark:text-night"
              >
                Зарегистрироваться
              </button>
            </>
          )}

          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>

        {/* ---------- Мобильная кнопка меню ---------- */}
        <div className="flex items-center gap-1.5 sm:hidden">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Открыть меню"
            className="grid h-10 w-10 place-items-center rounded-full border border-sand-300 text-ink dark:border-night-surface2 dark:text-white"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* ---------- Мобильное выезжающее меню ---------- */}
      {/* Рендерим через портал в body: шапка использует backdrop-blur (это CSS filter),
          а filter/backdrop-filter на предке — как и transform — создаёт новый "контейнер"
          для position:fixed потомков. Без портала меню оказывалось зажато в размер шапки. */}
      {menuOpen &&
        createPortal(
          <div className="fixed inset-0 z-[1000] sm:hidden">
            <div className="absolute inset-0 bg-ink/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[84vw] max-w-xs flex-col overflow-y-auto bg-white shadow-2xl dark:bg-night-surface">
            <div className="flex items-center justify-between border-b border-sand-200 px-4 py-4 dark:border-night-surface2">
              <span className="font-display text-lg font-semibold text-ink dark:text-white">Меню</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-lg hover:bg-sand-200 dark:text-white dark:hover:bg-night-surface2"
                aria-label="Закрыть меню"
              >
                <X size={19} />
              </button>
            </div>

            <div className="flex flex-col gap-1 px-3 py-3">
              <Link
                to="/articles"
                className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink hover:bg-sand-200 dark:text-white dark:hover:bg-night-surface2"
              >
                Статьи о путешествиях
              </Link>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onAddPlace();
                  }}
                  className="mt-1 inline-flex items-center gap-2 rounded-lg bg-coral px-3 py-2.5 text-[15px] font-bold text-white hover:bg-coral-600"
                >
                  <Plus size={16} />
                  Добавить место
                </button>
              )}
            </div>

            <div className="border-t border-sand-200 px-4 pb-2 pt-3 dark:border-night-surface2">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-mist">Места</p>
            </div>
            <div className="flex flex-col gap-0.5 px-3 pb-3">
              {defaultCategories.map((category) => (
                <Link
                  key={category}
                  to={`/?category=${encodeURIComponent(category)}`}
                  className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-sand-200 hover:text-ink dark:text-mist dark:hover:bg-night-surface2 dark:hover:text-white"
                >
                  {category}
                </Link>
              ))}
            </div>

            <div className="mt-auto border-t border-sand-200 px-3 py-3 dark:border-night-surface2">
              {session ? (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onSignOut();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-sand-300 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-sand-200 dark:border-night-surface2 dark:text-mist dark:hover:bg-night-surface2"
                >
                  <LogOut size={16} />
                  Выйти ({session.user?.email})
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenAuth('signIn');
                    }}
                    className="flex-1 rounded-lg border border-sand-300 px-3 py-2.5 text-sm font-semibold text-ink dark:border-night-surface2 dark:text-white"
                  >
                    Войти
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenAuth('signUp');
                    }}
                    className="flex-1 rounded-lg bg-lagoon px-3 py-2.5 text-sm font-bold text-white dark:bg-aqua dark:text-night"
                  >
                    Регистрация
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
          document.body
        )}
    </nav>
  );
}
