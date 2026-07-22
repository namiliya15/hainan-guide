import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

// Полноценный блог со статьями, карточками и редактором для админа —
// отдельная фаза из плана (раздел 6). Здесь пока заглушка, чтобы ссылка
// "Статьи о путешествиях" в шапке никуда не проваливалась уже сейчас.
export function ArticlesPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-lagoon/10 text-lagoon dark:bg-aqua/10 dark:text-aqua">
        <BookOpen size={28} />
      </div>
      <h1 className="font-display text-2xl font-medium text-ink dark:text-white">Статьи скоро появятся</h1>
      <p className="mt-2 text-slate-500 dark:text-mist">
        Здесь будет блог с историями и советами о путешествии по Санье и Хайнаню.
      </p>
      <Link to="/" className="mt-6 rounded-full bg-lagoon px-5 py-2.5 text-sm font-bold text-white hover:bg-lagoon-600 dark:bg-aqua dark:text-night">
        Вернуться на главную
      </Link>
    </div>
  );
}
