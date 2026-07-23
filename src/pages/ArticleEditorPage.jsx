import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Upload } from 'lucide-react';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { useArticles, slugify } from '../features/articles/useArticles';
import { RichTextEditor } from '../features/articles/RichTextEditor';

export function ArticleEditorPage({ session }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin(session);
  const { allArticles, createArticle, updateArticle, uploadCoverImage } = useArticles(session, isAdmin);
  const isEditing = Boolean(slug);
  const existing = isEditing ? allArticles.find((a) => a.slug === slug) : null;

  const [title, setTitle] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadedFor, setLoadedFor] = useState(null);

  // Подтягиваем существующую статью в форму один раз, когда она подгрузится —
  // не на каждый рендер (иначе перезатрём то, что админ уже печатает).
  useEffect(() => {
    if (existing && loadedFor !== existing.id) {
      setTitle(existing.title);
      setCustomSlug(existing.slug);
      setCoverImage(existing.cover_image || '');
      setContent(existing.content || '');
      setPublished(existing.published);
      setLoadedFor(existing.id);
    }
  }, [existing, loadedFor]);

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-slate-500 dark:text-mist">Эта страница доступна только администратору.</p>
      </div>
    );
  }
  if (isEditing && !existing) {
    return <div className="mx-auto max-w-md px-4 py-24 text-center text-slate-500 dark:text-mist">Загрузка...</div>;
  }

  async function handleCoverUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadCoverImage(file);
    if (url) setCoverImage(url);
    setUploading(false);
  }

  async function handleSave(publishNow) {
    if (!title.trim()) {
      alert('Введите заголовок статьи');
      return;
    }
    setSaving(true);
    const draft = {
      title,
      slug: customSlug || slugify(title),
      cover_image: coverImage,
      content,
      published: publishNow,
    };
    if (isEditing) {
      await updateArticle(existing.id, draft);
      navigate(`/articles/${draft.slug}`);
    } else {
      const created = await createArticle(draft, session?.user?.id);
      if (created) navigate(`/articles/${created.slug}`);
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-display text-2xl font-medium text-ink dark:text-white">
        {isEditing ? 'Редактировать статью' : 'Новая статья'}
      </h1>

      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Заголовок</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например: Неделя на юге Хайнаня с детьми"
          className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2.5 text-lg outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
        />
      </label>

      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">
          Адрес статьи (slug) — необязательно, сгенерируется из заголовка
        </span>
        <input
          value={customSlug}
          onChange={(e) => setCustomSlug(slugify(e.target.value))}
          placeholder={title ? slugify(title) : 'nedelya-na-yuge-hainanya'}
          className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
        />
      </label>

      <div className="mb-4">
        <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Обложка</span>
        {coverImage && <img src={coverImage} alt="Обложка" className="mb-2 h-40 w-full rounded-lg object-cover" />}
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-sand-200 dark:border-night-surface2 dark:bg-night-surface2 dark:text-mist">
            <Upload size={15} />
            Загрузить
            <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={uploading} />
          </label>
          <input
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="...или вставьте ссылку на фото"
            className="min-w-[220px] flex-1 rounded-lg border border-sand-300 px-3 py-2 text-sm outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
          />
        </div>
        {uploading && <p className="mt-1 text-xs text-lagoon dark:text-aqua">Загрузка...</p>}
      </div>

      <div className="mb-6">
        <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Текст статьи</span>
        {/* key заставляет редактор пересоздаться при переключении между статьями —
            contentEditable неконтролируем, см. комментарий внутри RichTextEditor.jsx */}
        <RichTextEditor key={existing?.id || 'new'} value={content} onChange={setContent} onUploadImage={uploadCoverImage} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg border border-sand-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-sand-200 disabled:opacity-60 dark:border-night-surface2 dark:text-mist dark:hover:bg-night-surface2"
        >
          <Save size={16} />
          Сохранить черновик
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-lagoon px-4 py-2.5 text-sm font-bold text-white hover:bg-lagoon-600 disabled:opacity-60 dark:bg-aqua dark:text-night"
        >
          <Save size={16} />
          Опубликовать
        </button>
      </div>
    </div>
  );
}
