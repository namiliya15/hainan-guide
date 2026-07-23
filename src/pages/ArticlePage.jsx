import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { useArticles } from '../features/articles/useArticles';

export function ArticlePage({ session }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin(session);
  const { allArticles, updateArticle, deleteArticle } = useArticles(session, isAdmin);

  // Админ может открыть статью по прямой ссылке даже как черновик (для просмотра
  // перед публикацией), обычный посетитель — только опубликованную.
  const article = useMemo(() => {
    const found = allArticles.find((a) => a.slug === slug);
    if (!found) return null;
    if (!found.published && !isAdmin) return null;
    return found;
  }, [allArticles, slug, isAdmin]);

  if (!article) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-slate-500 dark:text-mist">Статья не найдена.</p>
        <Link to="/articles" className="mt-4 inline-block text-sm font-bold text-lagoon dark:text-aqua">
          ← Ко всем статьям
        </Link>
      </div>
    );
  }

  async function handleDelete() {
    await deleteArticle(article.id);
    navigate('/articles');
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link to="/articles" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink dark:text-mist dark:hover:text-white">
        <ArrowLeft size={15} />
        Ко всем статьям
      </Link>

      {article.cover_image && (
        <img src={article.cover_image} alt={article.title} className="mb-6 h-64 w-full rounded-2xl object-cover sm:h-80" />
      )}

      {!article.published && (
        <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
          <EyeOff size={12} />
          Черновик — видно только тебе
        </span>
      )}

      <h1 className="font-display text-3xl font-medium text-ink dark:text-white sm:text-4xl">{article.title}</h1>

      <div
        className="mt-6 text-[15px] leading-relaxed text-slate-700 dark:text-mist [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink dark:[&_h2]:text-white [&_ul]:list-disc [&_ul]:pl-5 [&_img]:my-4 [&_img]:rounded-xl [&_a]:text-lagoon [&_a]:underline dark:[&_a]:text-aqua [&_p]:mb-3"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {isAdmin && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-sand-200 pt-5 dark:border-night-surface2">
          <Link
            to={`/articles/${article.slug}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sand-300 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-sand-200 dark:border-night-surface2 dark:text-mist dark:hover:bg-night-surface2"
          >
            <Edit size={15} />
            Редактировать
          </Link>
          <button
            type="button"
            onClick={() => updateArticle(article.id, { ...article, published: !article.published })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sand-300 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-sand-200 dark:border-night-surface2 dark:text-mist dark:hover:bg-night-surface2"
          >
            {article.published ? <EyeOff size={15} /> : <Eye size={15} />}
            {article.published ? 'Снять с публикации' : 'Опубликовать'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3.5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 size={15} />
            Удалить
          </button>
        </div>
      )}
    </article>
  );
}
