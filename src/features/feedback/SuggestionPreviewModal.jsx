import { X } from 'lucide-react';
import { ImageCarousel } from '../places/ImageCarousel';

export function SuggestionPreviewModal({ suggestion, onClose }) {
  if (!suggestion) return null;

  let photos = [];
  if (suggestion.photos) {
    try {
      photos = typeof suggestion.photos === 'string' ? JSON.parse(suggestion.photos) : suggestion.photos;
    } catch {
      photos = [];
    }
  }

  return (
    <div className="fixed inset-0 z-[1200] grid place-items-center bg-ink/50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white shadow-2xl dark:bg-night-surface">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-ink/40 text-white backdrop-blur hover:bg-ink/60"
        >
          <X size={18} />
        </button>

        <ImageCarousel images={photos} variant="modal" placeName={suggestion.name} />

        <div className="p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-coral">{suggestion.category}</p>
          <h2 className="font-display text-xl font-semibold text-ink dark:text-white">{suggestion.name}</h2>
          {suggestion.chinese_name && <p className="mt-1 text-sm text-slate-500 dark:text-mist">{suggestion.chinese_name}</p>}
          {suggestion.chinese_address && <p className="mt-0.5 text-xs text-slate-400">{suggestion.chinese_address}</p>}

          {(suggestion.working_hours || suggestion.price_info) && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-mist">
              {suggestion.working_hours && <span>🕐 {suggestion.working_hours}</span>}
              {suggestion.price_info && <span>{suggestion.price_info}</span>}
            </div>
          )}

          {(suggestion.description || suggestion.extra_info) && (
            <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-slate-600 dark:text-mist">
              {suggestion.description}
              {suggestion.description && suggestion.extra_info && '\n\n'}
              {suggestion.extra_info}
            </p>
          )}

          {suggestion.lat && suggestion.lng ? (
            <p className="mt-3 text-xs text-green-600 dark:text-aqua">✓ Координаты указаны: {suggestion.lat}, {suggestion.lng}</p>
          ) : (
            <p className="mt-3 text-xs text-amber-600">⚠️ Координаты не указаны — задать можно в режиме редактирования</p>
          )}

          {suggestion.note && <p className="mt-3 rounded-lg bg-sand-200 px-3 py-2 text-sm italic text-slate-500 dark:bg-night-surface2 dark:text-mist">Заметка автора: {suggestion.note}</p>}
        </div>
      </div>
    </div>
  );
}
