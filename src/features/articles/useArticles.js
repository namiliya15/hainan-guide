import { useEffect, useState } from 'react';
import { hasSupabaseConfig, supabase } from '../../lib/supabase';

const LOCAL_ARTICLES_KEY = 'hainan-guide-articles';

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function slugify(title) {
  const translit = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return title
    .toLowerCase()
    .split('')
    .map((ch) => translit[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// Не авторизован ИЛИ не админ — видит только опубликованные статьи.
// Админ (autenticated as ADMIN_EMAIL) видит и черновики — это фильтруется
// автоматически на уровне RLS-политики в Supabase, здесь просто грузим всё,
// что вернул запрос.
export function useArticles(session, isAdmin) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  async function loadArticles() {
    setLoading(true);
    if (!hasSupabaseConfig) {
      setArticles(readJson(LOCAL_ARTICLES_KEY, []));
      setLoading(false);
      return;
    }
    const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    setArticles(data || []);
    setLoading(false);
  }

  function showNotice(text) {
    setNotice(text);
    setTimeout(() => setNotice(''), 2500);
  }

  async function uploadCoverImage(file) {
    if (!hasSupabaseConfig) return null;
    const fileExt = file.name.split('.').pop();
    const filePath = `article-covers/${crypto.randomUUID()}/${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('place-images').upload(filePath, file);
    if (error) {
      showNotice('Ошибка загрузки обложки: ' + error.message);
      return null;
    }
    const { data } = supabase.storage.from('place-images').getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function createArticle(draft, userId) {
    const article = {
      id: crypto.randomUUID(),
      author_id: userId,
      title: draft.title.trim(),
      slug: draft.slug || slugify(draft.title),
      cover_image: draft.cover_image || null,
      content: draft.content || '',
      published: Boolean(draft.published),
    };
    if (!hasSupabaseConfig) {
      const next = [article, ...readJson(LOCAL_ARTICLES_KEY, [])];
      writeJson(LOCAL_ARTICLES_KEY, next);
      setArticles(next);
      showNotice('Статья сохранена локально.');
      return article;
    }
    const { error } = await supabase.from('articles').insert(article);
    if (error) {
      showNotice('Ошибка: ' + error.message);
      return null;
    }
    showNotice('Статья создана.');
    await loadArticles();
    return article;
  }

  async function updateArticle(id, draft) {
    const patch = {
      title: draft.title.trim(),
      slug: draft.slug || slugify(draft.title),
      cover_image: draft.cover_image || null,
      content: draft.content || '',
      published: Boolean(draft.published),
      updated_at: new Date(),
    };
    if (!hasSupabaseConfig) {
      const next = articles.map((a) => (a.id === id ? { ...a, ...patch } : a));
      writeJson(LOCAL_ARTICLES_KEY, next);
      setArticles(next);
      showNotice('Статья обновлена локально.');
      return;
    }
    const { error } = await supabase.from('articles').update(patch).eq('id', id);
    showNotice(error ? 'Ошибка: ' + error.message : 'Статья обновлена.');
    await loadArticles();
  }

  async function deleteArticle(id) {
    if (!confirm('Удалить статью без возможности восстановления?')) return;
    if (!hasSupabaseConfig) {
      const next = articles.filter((a) => a.id !== id);
      writeJson(LOCAL_ARTICLES_KEY, next);
      setArticles(next);
      return;
    }
    const { error } = await supabase.from('articles').delete().eq('id', id);
    showNotice(error ? 'Ошибка: ' + error.message : 'Статья удалена.');
    await loadArticles();
  }

  const visibleArticles = isAdmin ? articles : articles.filter((a) => a.published);

  return {
    articles: visibleArticles,
    allArticles: articles,
    loading,
    notice,
    createArticle,
    updateArticle,
    deleteArticle,
    uploadCoverImage,
  };
}
