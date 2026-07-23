import { Link } from 'react-router-dom';
import { BookOpen, Plus } from 'lucide-react';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { useArticles } from '../features/articles/useArticles';
import { ArticleCard } from '../features/articles/ArticleCard';

export function ArticlesPage({ session }) {
  const isAdmin = useIsAdmin(session);
  const { articles, loading } = useArticles(session, isAdmin);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium text-ink dark:text-white">Статьи о путешествиях</h1>
          <p className="mt-1 text-slate-500 dark:text-mist">Истории и советы о путешествии по Санье и Хайнаню.</p>
        </div>
        {isAdmin && (
          <Link
            to="/articles/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-lagoon px-4 py-2.5 text-sm font-bold text-white hover:bg-lagoon-600 dark:bg-aqua dark:text-night"
          >
            <Plus size={16} />
            Написать статью
          </Link>
        )}
      </div>

      {!loading && articles.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-sand-300 py-20 text-center dark:border-night-surface2">
          <BookOpen className="mb-3 text-mist" size={30} />
          <p className="text-slate-500 dark:text-mist">Статей пока нет{isAdmin ? ' — напиши первую!' : ', скоро появятся.'}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
