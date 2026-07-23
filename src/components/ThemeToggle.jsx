import { Moon, Sun } from 'lucide-react';

export function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Переключить тему"
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-sand-300 bg-white text-ink transition hover:bg-sand-200 dark:border-night-surface2 dark:bg-night-surface dark:text-white dark:hover:bg-night-surface2"
    >
      {theme === 'dark' ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}
