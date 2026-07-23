import { Link } from 'react-router-dom';
import { EyeOff } from 'lucide-react';

function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  return div.textContent || '';
}

export function ArticleCard({ article }) {
  const preview = stripHtml(article.content).slice(0, 140);

  return (
    <Link
      to={`/articles/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-sand-300 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-night-surface2 dark:bg-night-surface"
    >
      <div className="h-40 w-full bg-gradient-to-br from-lagoon to-aqua">
        {article.cover_image && <img src={article.cover_image} alt={article.title} className="h-40 w-full object-cover" />}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {!article.published && (
          <span className="mb-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
            <EyeOff size={11} />
            Черновик
          </span>
        )}
        <h3 className="font-display text-lg font-semibold text-ink dark:text-white">{article.title}</h3>
        <p className="mt-1 line-clamp-3 flex-1 text-[13.5px] leading-relaxed text-slate-500 dark:text-mist">{preview}</p>
        <span className="mt-3 text-xs font-bold text-lagoon dark:text-aqua">Читать →</span>
      </div>
    </Link>
  );
}
