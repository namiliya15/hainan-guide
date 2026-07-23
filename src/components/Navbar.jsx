import { Link } from 'react-router-dom';
import { LogOut, Plus } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Navbar({ session, isAdmin, theme, onToggleTheme, onSignOut, onOpenAuth, onAddPlace }) {
  return (
    <nav className="sticky top-0 z-40 border-b border-sand-300 bg-sand/85 backdrop-blur dark:border-night-surface2 dark:bg-night/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <svg className="h-8 w-8 text-lagoon dark:text-aqua" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 44C24 44 24 30 24 22C24 14 18 8 8 8C8 8 10 20 18 24C22 26 24 30 24 34" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M24 22C24 14 30 8 40 8C40 8 38 20 30 24C26 26 24 28 24 28" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M24 22C24 15 22 10 16 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M24 22C24 15 26 10 32 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          <span className="font-display text-[17px] font-semibold text-ink dark:text-white">Хайнань гид</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            to="/articles"
            className="hidden rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-sand-200 hover:text-ink sm:inline-block dark:text-mist dark:hover:bg-night-surface2 dark:hover:text-white"
          >
            Статьи о путешествиях
          </Link>

          {isAdmin && (
            <button
              type="button"
              onClick={onAddPlace}
              className="hidden items-center gap-1.5 rounded-full bg-coral px-3.5 py-2 text-sm font-bold text-white hover:bg-coral-600 sm:inline-flex"
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
      </div>
    </nav>
  );
}
