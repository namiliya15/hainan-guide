import { useEffect, useRef, useState } from 'react';
import { Check, Compass, Copy, Edit, Flag, Heart, HeartOff, MapPin, Navigation, Trash2 } from 'lucide-react';
import { ImageCarousel } from './ImageCarousel';

export function PlaceCard({ place, favorite, isAdmin, onFavorite, onShowMap, onEdit, onDelete, onDeleteImage, onReportIssue }) {
  const [copiedName, setCopiedName] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const descRef = useRef(null);

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

  // Карточки всегда одной высоты (см. h-full + flex-col на article),
  // а кнопка "Показать полностью" появляется только если текст реально
  // не вмещается в 3 строки — проверяем это после отрисовки.
  useEffect(() => {
    if (!descRef.current) return;
    setOverflowing(descRef.current.scrollHeight > descRef.current.clientHeight + 1);
  }, [place.description, place.extra_info]);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-sand-300 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-night-surface2 dark:bg-night-surface">
      <div className="relative">
        <ImageCarousel images={photos} onDelete={(idx) => onDeleteImage?.(place.id, idx)} isAdmin={isAdmin} placeName={place.name} />
        <button
          type="button"
          onClick={() => onFavorite(place.id)}
          className={`absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full backdrop-blur transition ${
            favorite ? 'bg-coral text-white' : 'bg-ink/35 text-white hover:bg-ink/50'
          }`}
          aria-label={favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          {favorite ? <Heart size={16} fill="currentColor" /> : <HeartOff size={16} />}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-coral">{place.category}</p>
        <h3 className="mt-0.5 truncate font-display text-lg font-semibold text-ink dark:text-white">{place.name}</h3>

        {place.chinese_name && (
          <div className="mt-0.5 flex items-center gap-1">
            <p className="truncate text-sm text-slate-500 dark:text-mist">{place.chinese_name}</p>
            <button
              type="button"
              onClick={() => copyToClipboard(place.chinese_name, 'name')}
              className="shrink-0 text-slate-400 transition hover:text-lagoon dark:hover:text-aqua"
              title="Копировать китайское название"
            >
              {copiedName ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </div>
        )}

        {place.chinese_address && (
          <div className="mt-0.5 flex items-center gap-1">
            <p className="truncate text-xs text-slate-400 dark:text-mist">{place.chinese_address}</p>
            <button
              type="button"
              onClick={() => copyToClipboard(place.chinese_address, 'address')}
              className="shrink-0 text-slate-400 transition hover:text-lagoon dark:hover:text-aqua"
              title="Копировать адрес"
            >
              {copiedAddress ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </div>
        )}

        {(!place.lat || !place.lng) && (
          <p className="mt-1 text-xs text-amber-500">⚠️ Без координат — не отображается на карте</p>
        )}

        {(place.working_hours || place.price_info) && (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-mist">
            {place.working_hours && <span>🕐 {place.working_hours}</span>}
            {place.price_info && <span>{place.price_info}</span>}
          </div>
        )}

        {place.description && (
          <>
            <p
              ref={descRef}
              className={`mt-2 text-[13.5px] leading-relaxed text-slate-600 dark:text-mist ${
                expanded ? '' : 'line-clamp-3'
              }`}
            >
              {place.description}
              {place.extra_info && (
                <>
                  <br />
                  <br />
                  {place.extra_info}
                </>
              )}
            </p>
            {overflowing && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mb-2 mt-0.5 self-start text-xs font-bold text-lagoon dark:text-aqua"
              >
                {expanded ? 'Свернуть' : 'Показать полностью'}
              </button>
            )}
          </>
        )}

        {/* margin-top: auto — прижимает действия к низу карточки независимо от длины текста выше */}
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          {amapUrl && (
            <a
              href={amapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-lagoon px-3 py-2 text-sm font-bold text-white hover:bg-lagoon-600 dark:bg-aqua dark:text-night dark:hover:opacity-90"
            >
              <Navigation size={15} />
              Amap
            </a>
          )}
          {place.lat && place.lng && (
            <button
              type="button"
              onClick={() => onShowMap(place)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-sand-300 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-sand-200 dark:border-night-surface2 dark:text-mist dark:hover:bg-night-surface2"
            >
              <MapPin size={15} />
              На карте
            </button>
          )}
          {place.trip_url && (
            <a
              href={place.trip_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              <Compass size={15} />
              Trip.com
            </a>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 border-t border-sand-200 pt-2 dark:border-night-surface2">
          <button
            type="button"
            onClick={() => onReportIssue?.(place)}
            className="inline-flex items-center gap-1 text-xs text-slate-400 transition hover:text-lagoon dark:text-mist dark:hover:text-aqua"
          >
            <Flag size={12} />
            Сообщить об изменениях
          </button>

          {isAdmin && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onEdit(place)}
                className="inline-flex items-center gap-1 text-xs text-slate-500 transition hover:text-lagoon dark:text-mist dark:hover:text-aqua"
              >
                <Edit size={13} />
                Редактировать
              </button>
              <button
                type="button"
                onClick={() => onDelete(place.id)}
                className="inline-flex items-center gap-1 text-xs text-slate-500 transition hover:text-red-600 dark:text-mist"
              >
                <Trash2 size={13} />
                Удалить
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
