import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { MessageCircleHeart, X } from 'lucide-react';

// Портал в body по той же причине, что и у Lightbox/мобильного меню —
// чтобы не зависеть от transform/filter на родительских элементах.
export function ReplyToast({ show, onClose, onView }) {
  if (!show) return null;

  return createPortal(
    <div className="fixed inset-x-4 top-[calc(env(safe-area-inset-top)+4.5rem)] z-[1200] flex justify-center sm:inset-x-auto sm:right-6 sm:justify-end">
      <div className="flex w-full max-w-sm items-start gap-3 rounded-2xl border border-sand-300 bg-white p-4 shadow-2xl dark:border-night-surface2 dark:bg-night-surface">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lagoon/10 text-lagoon dark:bg-aqua/10 dark:text-aqua">
          <MessageCircleHeart size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink dark:text-white">Вам написал администратор сайта 🙂</p>
          <Link
            to="/my-submissions"
            onClick={onView}
            className="mt-1.5 inline-block text-sm font-bold text-lagoon hover:underline dark:text-aqua"
          >
            Посмотреть ответ
          </Link>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-sand-200 dark:hover:bg-night-surface2"
          aria-label="Закрыть уведомление"
        >
          <X size={15} />
        </button>
      </div>
    </div>,
    document.body
  );
}
