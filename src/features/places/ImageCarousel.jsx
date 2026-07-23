import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation as SwiperNav, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Trash2, ZoomIn } from 'lucide-react';
import { Lightbox } from '../../components/Lightbox';

// variant="card"  — карточка в сетке на главной, всегда фиксированная высота (h-40)
// variant="modal" — карточка по двойному тапу на карте, высота подстраивается под фото
export function ImageCarousel({ images, onDelete, isAdmin, variant = 'card' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="grid h-40 w-full place-items-center bg-sand-200 dark:bg-night-surface2">
        <ImageIcon className="text-mist" size={30} />
      </div>
    );
  }

  const isModal = variant === 'modal';

  return (
    <div className="group relative">
      <Swiper
        modules={[SwiperNav, Pagination]}
        onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
        navigation={{ nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }}
        pagination={{ clickable: true }}
        loop={images.length > 1}
        autoHeight={isModal}
        className={isModal ? '' : 'h-40'}
      >
        {images.map((img, idx) => (
          <SwiperSlide key={idx}>
            <button
              type="button"
              onClick={() => setLightboxIndex(idx)}
              className={`relative block w-full ${isModal ? '' : 'h-40'}`}
              aria-label="Открыть фото полностью"
            >
              <img
                src={img}
                alt={`Фото ${idx + 1}`}
                className={isModal ? 'max-h-[60vh] w-full object-contain bg-sand-200 dark:bg-night-surface2' : 'h-40 w-full object-cover'}
              />
              <span className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-ink/45 text-white opacity-0 transition group-hover:opacity-100">
                <ZoomIn size={14} />
              </span>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="swiper-button-prev absolute left-2 top-1/2 z-10 grid -translate-y-1/2 place-items-center rounded-full bg-ink/50 p-1 text-white opacity-0 transition group-hover:opacity-100"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="swiper-button-next absolute right-2 top-1/2 z-10 grid -translate-y-1/2 place-items-center rounded-full bg-ink/50 p-1 text-white opacity-0 transition group-hover:opacity-100"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}
      {isAdmin && onDelete && images.length > 0 && (
        <button
          type="button"
          onClick={() => onDelete(currentIndex)}
          className="absolute right-2 top-2 z-20 rounded-full bg-red-500 p-1 text-white opacity-0 transition group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      )}

      <Lightbox images={images} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onChangeIndex={setLightboxIndex} />
    </div>
  );
}
