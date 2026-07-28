import { useRef, useState } from 'react';
import { Check, Send, Upload, X } from 'lucide-react';
import { LocationPicker } from '../map/LocationPicker';

function Field({ label, value, onChange, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">{label}</span>
      <input
        className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-ink outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    </label>
  );
}

// mode="suggestion" — публикация предложенного пользователем места (создаёт
//   новую запись в places и отмечает предложение опубликованным).
// mode="place" — прямое редактирование уже существующего места (например,
//   по кнопке "Редактировать место" из сообщения об изменении).
export function AdminPlaceEditForm({ mode, initial, categories, onClose, onSave, onUploadImage }) {
  const [draft, setDraft] = useState({
    name: initial.name || '',
    chinese_name: initial.chinese_name || '',
    chinese_address: initial.chinese_address || '',
    category: initial.category || 'Интересные места',
    description: initial.description || '',
    working_hours: initial.working_hours || '',
    price_info: initial.price_info || '',
    extra_info: initial.extra_info || '',
    photos: initial.photos || null,
    lat: initial.lat ?? '',
    lng: initial.lng ?? '',
    amap_url: initial.amap_url || '',
    trip_url: initial.trip_url || '',
  });
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

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

  function handleAddUrl() {
    if (!urlInput.trim()) return;
    set({ photos: JSON.stringify([...previewPhotos, urlInput.trim()]) });
    setUrlInput('');
  }

  function removePhoto(idx) {
    const next = [...previewPhotos];
    next.splice(idx, 1);
    set({ photos: next.length ? JSON.stringify(next) : null });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!draft.name.trim()) {
      alert('Введите название места');
      return;
    }
    setSaving(true);
    await onSave(draft);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[1200] grid place-items-center bg-ink/50 p-4">
      <form onSubmit={handleSubmit} className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-night-surface">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-ink dark:text-white">
            {mode === 'suggestion' ? 'Проверка и публикация места' : 'Редактировать место'}
          </h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-sand-200 dark:text-white dark:hover:bg-night-surface2">
            <X size={19} />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Название" value={draft.name} onChange={(v) => set({ name: v })} required />
          <Field label="Китайское название" value={draft.chinese_name} onChange={(v) => set({ chinese_name: v })} />
          <div className="sm:col-span-2">
            <Field label="Адрес" value={draft.chinese_address} onChange={(v) => set({ chinese_address: v })} />
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Категория</span>
            <select
              value={draft.category}
              onChange={(e) => set({ category: e.target.value })}
              className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
            >
              {categories.filter((c) => c !== 'Избранное').map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <Field label="Время работы" value={draft.working_hours} onChange={(v) => set({ working_hours: v })} placeholder="08:00–17:30" />
          <Field label="Стоимость" value={draft.price_info} onChange={(v) => set({ price_info: v })} placeholder="от ¥98 / Бесплатно" />
        </div>

        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Описание</span>
          <textarea
            value={draft.description}
            onChange={(e) => set({ description: e.target.value })}
            className="min-h-20 w-full rounded-lg border border-sand-300 bg-white px-3 py-2 outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Дополнительно</span>
          <textarea
            value={draft.extra_info}
            onChange={(e) => set({ extra_info: e.target.value })}
            className="min-h-16 w-full rounded-lg border border-sand-300 bg-white px-3 py-2 outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
          />
        </label>

        <div className="mt-4">
          <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Место на карте</span>
          <LocationPicker lat={draft.lat} lng={draft.lng} onChange={(lat, lng) => set({ lat, lng })} />
        </div>

        <div className="mt-4">
          <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Фотографии</span>
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
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-sand-200 dark:border-night-surface2 dark:bg-night-surface2 dark:text-mist">
              <Upload size={16} />
              Загрузить фото
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" disabled={uploading} />
            </label>
            <div className="flex flex-1 gap-2">
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="...или ссылка на фото"
                className="flex-1 rounded-lg border border-sand-300 px-3 py-2 outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                disabled={!urlInput.trim()}
                className="rounded-lg bg-lagoon px-3 py-2 text-sm font-bold text-white hover:bg-lagoon-600 disabled:opacity-50 dark:bg-aqua dark:text-night"
              >
                Добавить
              </button>
            </div>
          </div>
          {uploading && <p className="mt-1 text-xs text-lagoon dark:text-aqua">Загрузка...</p>}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-lagoon px-4 py-3 font-bold text-white hover:bg-lagoon-600 disabled:opacity-60 dark:bg-aqua dark:text-night"
        >
          {mode === 'suggestion' ? <Send size={17} /> : <Check size={17} />}
          {mode === 'suggestion' ? 'Опубликовать место' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  );
}
