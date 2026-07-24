import { useState } from 'react';
import { Check, Compass, Copy, Edit, Flag, Heart, HeartOff, Navigation, Trash2, X } from 'lucide-react';
import { ImageCarousel } from './ImageCarousel';

export function PlaceModal({ place, favorite, isAdmin, onClose, onFavorite, onEdit, onDelete, onDeleteImage, onReportIssue }) {
  const [copiedName, setCopiedName] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  if (!place) return null;

  const amapUrl =
    place.amap_url ||
    (place.lat && place.lng
      ? `https://uri.amap.com/marker?position=${place.lng},${place.lat}&name=${encodeURIComponent(place.chinese_name || place.name)}`
      : null);

  async function copyToClipboard(text, type) {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'name') {
        setCopiedName(true);
        setTimeout(() => setCopiedName(false), 2000);
      } else {
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
      }
    } catch (err) {
      console.error('Ошибка копирования:', err);
    }
  }

  let photos = [];
  if (place.photos) {
    try {
      photos = typeof place.photos === 'string' ? JSON.parse(place.photos) : place.photos;
    } catch {
      photos = [place.photos];
    }
  } else if (place.photo_url) {
    photos = [place.photo_url];
  }

  return (
    <div
      className="fixed inset-0 z-[1100] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white shadow-2xl dark:bg-night-surface">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-ink/40 text-white backdrop-blur hover:bg-ink/60"
          aria-label="Закрыть"
        >
          <X size={18} />
        </button>

        <ImageCarousel images={photos} onDelete={(idx) => onDeleteImage?.(place.id, idx)} isAdmin={isAdmin} variant="modal" placeName={place.name} />

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-coral">{place.category}</p>
              <h2 className="font-display text-xl font-semibold text-ink dark:text-white">{place.name}</h2>
            </div>
            <button
              type="button"
              onClick={() => onFavorite(place.id)}
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                favorite ? 'bg-coral text-white' : 'border border-sand-300 text-slate-500 dark:border-night-surface2 dark:text-mist'
              }`}
              aria-label={favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
            >
              {favorite ? <Heart size={17} fill="currentColor" /> : <HeartOff size={17} />}
            </button>
          </div>

          {place.chinese_name && (
            <div className="mt-1 flex items-center gap-1.5">
              <p className="text-sm text-slate-500 dark:text-mist">{place.chinese_name}</p>
              <button type="button" onClick={() => copyToClipboard(place.chinese_name, 'name')} className="text-slate-400 hover:text-lagoon dark:hover:text-aqua">
                {copiedName ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          )}
          {place.chinese_address && (
            <div className="mt-0.5 flex items-center gap-1.5">
              <p className="text-xs text-slate-400 dark:text-mist">{place.chinese_address}</p>
              <button type="button" onClick={() => copyToClipboard(place.chinese_address, 'address')} className="text-slate-400 hover:text-lagoon dark:hover:text-aqua">
                {copiedAddress ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          )}

          {(place.working_hours || place.price_info) && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-mist">
              {place.working_hours && <span>🕐 {place.working_hours}</span>}
              {place.price_info && <span>{place.price_info}</span>}
            </div>
          )}

          {(place.description || place.extra_info) && (
            <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-slate-600 dark:text-mist">
              {place.description}
              {place.description && place.extra_info && '\n\n'}
              {place.extra_info}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {amapUrl && (
              <a href={amapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-lagoon px-3 py-2 text-sm font-bold text-white hover:bg-lagoon-600 dark:bg-aqua dark:text-night">
                <Navigation size={15} />
                Открыть в Amap
              </a>
            )}
            {place.trip_url && (
              <a href={place.trip_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700">
                <Compass size={15} />
                Trip.com
              </a>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-sand-200 pt-3 dark:border-night-surface2">
            <button type="button" onClick={() => onReportIssue?.(place)} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-lagoon dark:text-mist dark:hover:text-aqua">
              <Flag size={12} />
              Сообщить об изменениях
            </button>
            {isAdmin && (
              <div className="flex gap-3">
                <button type="button" onClick={() => onEdit(place)} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-lagoon dark:text-mist dark:hover:text-aqua">
                  <Edit size={13} />
                  Редактировать
                </button>
                <button type="button" onClick={() => onDelete(place.id)} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 dark:text-mist">
                  <Trash2 size={13} />
                  Удалить
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
