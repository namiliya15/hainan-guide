import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export function Lightbox({ images, index, onClose, onChangeIndex }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onChangeIndex((index + 1) % images.length);
      if (e.key === 'ArrowLeft') onChangeIndex((index - 1 + images.length) % images.length);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, images.length, onChangeIndex, onClose]);

  if (index === null || index === undefined) return null;

  return (
    <div
      className="fixed inset-0 z-[1300] grid place-items-center bg-black/90 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
        aria-label="Закрыть"
      >
        <X size={20} />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => onChangeIndex((index - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-4"
            aria-label="Предыдущее фото"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={() => onChangeIndex((index + 1) % images.length)}
            className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-4"
            aria-label="Следующее фото"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      <img
        src={images[index]}
        alt={`Фото ${index + 1} из ${images.length}`}
        className="max-h-[90vh] max-w-[92vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <div className="absolute bottom-5 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
