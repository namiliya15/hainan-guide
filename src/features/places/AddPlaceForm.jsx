import { useRef, useState } from 'react';
import { Plus, Upload, X } from 'lucide-react';

function Input({ label, value, onChange, type = 'text', ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">{label}</span>
      <input
        className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-ink outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
        type={type}
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </label>
  );
}

export function AddPlaceForm({ draft, categories, onChange, onSubmit, onClose, isEditing, onUploadImages }) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  async function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    const uploadedUrls = [];
    for (const file of files) {
      const url = await onUploadImages(file);
      if (url) uploadedUrls.push(url);
    }
    const currentPhotos = draft.photos ? (typeof draft.photos === 'string' ? JSON.parse(draft.photos) : draft.photos) : [];
    onChange({ photos: JSON.stringify([...currentPhotos, ...uploadedUrls]) });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleAddUrl() {
    if (!urlInput.trim()) return;
    const currentPhotos = draft.photos ? (typeof draft.photos === 'string' ? JSON.parse(draft.photos) : draft.photos) : [];
    onChange({ photos: JSON.stringify([...currentPhotos, urlInput.trim()]) });
    setUrlInput('');
  }

  function removePhoto(index) {
    const currentPhotos = draft.photos ? (typeof draft.photos === 'string' ? JSON.parse(draft.photos) : draft.photos) : [];
    currentPhotos.splice(index, 1);
    onChange({ photos: currentPhotos.length ? JSON.stringify(currentPhotos) : null });
  }

  let previewPhotos = [];
  if (draft.photos) {
    try {
      previewPhotos = typeof draft.photos === 'string' ? JSON.parse(draft.photos) : draft.photos;
    } catch {
      previewPhotos = [];
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-ink/50 p-4">
      <form
        onSubmit={onSubmit}
        className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-night-surface"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-ink dark:text-white">
            {isEditing ? 'Редактировать место' : 'Добавить место'}
          </h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-sand-200 dark:hover:bg-night-surface2 dark:text-white">
            <X size={19} />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Название" value={draft.name} onChange={(value) => onChange({ name: value })} required />
          <Input label="Китайское название" value={draft.chinese_name} onChange={(value) => onChange({ chinese_name: value })} />
          <div className="sm:col-span-2">
            <Input
              label="Адрес"
              value={draft.chinese_address || ''}
              onChange={(value) => onChange({ chinese_address: value })}
              placeholder="Китайский или английский адрес"
            />
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Категория</span>
            <select
              className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
              value={draft.category}
              onChange={(event) => onChange({ category: event.target.value })}
            >
              {categories.filter((category) => category !== 'Избранное').map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <div className="sm:col-span-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Фотографии</span>
              <div className="mb-2 flex flex-wrap gap-2">
                {previewPhotos.map((photo, idx) => (
                  <div key={idx} className="relative h-16 w-16 overflow-hidden rounded border border-sand-300">
                    <img src={photo} alt={`preview ${idx}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute right-0 top-0 rounded-full bg-red-500 p-0.5 text-white"
                    >
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
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Или вставьте ссылку на фото..."
                    className="flex-1 rounded-lg border border-sand-300 px-3 py-2 outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    disabled={!urlInput.trim()}
                    className="inline-flex items-center gap-1 rounded-lg bg-lagoon px-3 py-2 text-sm font-bold text-white hover:bg-lagoon-600 disabled:opacity-50"
                  >
                    Добавить
                  </button>
                </div>
              </div>
              {uploading && <p className="mt-1 text-xs text-lagoon dark:text-aqua">Загрузка...</p>}
              <p className="mt-1 text-xs text-slate-400">Можно загрузить несколько фото (JPG, PNG) или добавить по ссылке</p>
            </label>
          </div>

          <Input label="Ссылка Amap" value={draft.amap_url || ''} onChange={(value) => onChange({ amap_url: value })} placeholder="https://uri.amap.com/marker?position=109.515,18.2218" />
          <Input label="Ссылка Trip.com" value={draft.trip_url || ''} onChange={(value) => onChange({ trip_url: value })} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Input
            label="Время работы"
            value={draft.working_hours || ''}
            onChange={(value) => onChange({ working_hours: value })}
            placeholder="Например: 08:00–17:30"
          />
          <Input
            label="Стоимость"
            value={draft.price_info || ''}
            onChange={(value) => onChange({ price_info: value })}
            placeholder="Например: от ¥98 или Бесплатно"
          />
        </div>
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Описание</span>
          <textarea
            className="min-h-24 w-full rounded-lg border border-sand-300 bg-white px-3 py-2 outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
            value={draft.description || ''}
            onChange={(event) => onChange({ description: event.target.value })}
            placeholder="Общее описание места. Для переноса строки нажмите Enter."
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Дополнительно</span>
          <textarea
            className="min-h-20 w-full rounded-lg border border-sand-300 bg-white px-3 py-2 outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
            value={draft.extra_info || ''}
            onChange={(event) => onChange({ extra_info: event.target.value })}
            placeholder="Любая полезная деталь: как добраться, лайфхаки, что взять с собой"
          />
        </label>
        {draft.lat && draft.lng ? (
          <p className="mt-2 text-xs text-green-600 dark:text-aqua">✓ Координаты: {draft.lat}, {draft.lng}</p>
        ) : (
          <p className="mt-2 text-xs text-amber-600">
            💡 Координаты не заданы. Место не будет отображаться на карте.
            <br />• Кликните на карту, чтобы добавить координаты
          </p>
        )}
        <button
          type="submit"
          disabled={uploading}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-lagoon px-4 py-3 font-bold text-white hover:bg-lagoon-600 dark:bg-aqua dark:text-night"
        >
          <Plus size={18} />
          {isEditing ? 'Сохранить изменения' : 'Сохранить место'}
        </button>
      </form>
    </div>
  );
}
