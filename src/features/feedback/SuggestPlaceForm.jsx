import { useRef, useState } from 'react';
import { Send, Upload, X } from 'lucide-react';
import { defaultCategories } from '../../data/categories';

const EMPTY = { name: '', chinese_name: '', chinese_address: '', category: 'Интересные места', description: '', note: '', email: '', photos: null };

// Координаты здесь больше не запрашиваются у пользователя — печатать точные
// десятичные широту/долготу руки редко кто умеет и вводит верно. Точку на
// карте теперь ставит админ при проверке (форма AdminPlaceEditForm), а тут
// вместо этого можно приложить фото — так предложение легче оценить.
export function SuggestPlaceForm({ open, onClose, onSubmit, onUploadImage, needsEmail }) {
  const [draft, setDraft] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef(null);

  if (!open) return null;

  function set(patch) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  let previewPhotos = [];
  if (draft.photos) {
    try {
      previewPhotos = typeof draft.photos === 'string' ? JSON.parse(draft.photos) : draft.photos;
    } catch {
      previewPhotos = [];
    }
  }

  async function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    const uploaded = [];
    for (const file of files) {
      const url = await onUploadImage(file);
      if (url) uploaded.push(url);
    }
    set({ photos: JSON.stringify([...previewPhotos, ...uploaded]) });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removePhoto(idx) {
    const next = [...previewPhotos];
    next.splice(idx, 1);
    set({ photos: next.length ? JSON.stringify(next) : null });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSending(true);
    const ok = await onSubmit(draft);
    setSending(false);
    if (ok) setDone(true);
  }

  function handleClose() {
    setDone(false);
    setDraft(EMPTY);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-ink/50 p-4">
      <div className="max-h-[92vh] w-full max-w-xl overflow-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-night-surface">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-ink dark:text-white">Предложить место</h2>
          <button type="button" onClick={handleClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-sand-200 dark:text-white dark:hover:bg-night-surface2">
            <X size={19} />
          </button>
        </div>

        {done ? (
          <div className="py-6 text-center">
            <p className="mb-4 text-slate-600 dark:text-mist">Спасибо! Место отправлено на проверку админу.</p>
            <button type="button" onClick={handleClose} className="rounded-lg bg-lagoon px-4 py-2.5 text-sm font-bold text-white hover:bg-lagoon-600 dark:bg-aqua dark:text-night">
              Готово
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Название места *</span>
              <input
                required
                value={draft.name}
                onChange={(e) => set({ name: e.target.value })}
                className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Китайское название</span>
              <input
                value={draft.chinese_name}
                onChange={(e) => set({ chinese_name: e.target.value })}
                className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Категория</span>
              <select
                value={draft.category}
                onChange={(e) => set({ category: e.target.value })}
                className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
              >
                {defaultCategories.filter((c) => c !== 'Избранное').map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Адрес или ориентир</span>
              <input
                value={draft.chinese_address}
                onChange={(e) => set({ chinese_address: e.target.value })}
                placeholder="Опишите словами, где это — точную точку админ поставит на карте сам"
                className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Почему это место стоит добавить?</span>
              <textarea
                value={draft.description}
                onChange={(e) => set({ description: e.target.value })}
                className="min-h-20 w-full rounded-lg border border-sand-300 bg-white px-3 py-2 outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
              />
            </label>

            <div className="sm:col-span-2">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Фото (необязательно)</span>
              <div className="mb-2 flex flex-wrap gap-2">
                {previewPhotos.map((photo, idx) => (
                  <div key={idx} className="relative h-16 w-16 overflow-hidden rounded border border-sand-300">
                    <img src={photo} alt={`preview ${idx}`} className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removePhoto(idx)} className="absolute right-0 top-0 rounded-full bg-red-500 p-0.5 text-white">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-sand-200 dark:border-night-surface2 dark:bg-night-surface2 dark:text-mist">
                <Upload size={16} />
                Загрузить фото
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" disabled={uploading} />
              </label>
              {uploading && <p className="mt-1 text-xs text-lagoon dark:text-aqua">Загрузка...</p>}
            </div>

            {needsEmail && (
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Email (чтобы админ мог ответить)</span>
                <input
                  type="email"
                  value={draft.email}
                  onChange={(e) => set({ email: e.target.value })}
                  className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
                />
              </label>
            )}
            <button
              type="submit"
              disabled={sending || uploading}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-lagoon px-4 py-3 font-bold text-white hover:bg-lagoon-600 disabled:opacity-60 dark:bg-aqua dark:text-night sm:col-span-2"
            >
              <Send size={16} />
              {sending ? 'Отправляем...' : 'Отправить на проверку'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
