import { useState } from 'react';
import { Send, X } from 'lucide-react';
import { defaultCategories } from '../../data/categories';

export function SuggestPlaceForm({ open, onClose, onSubmit, needsEmail }) {
  const [draft, setDraft] = useState({
    name: '',
    chinese_name: '',
    chinese_address: '',
    category: 'Интересные места',
    description: '',
    lat: '',
    lng: '',
    note: '',
    email: '',
  });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  function set(patch) {
    setDraft((current) => ({ ...current, ...patch }));
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
    setDraft({ name: '', chinese_name: '', chinese_address: '', category: 'Интересные места', description: '', lat: '', lng: '', note: '', email: '' });
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
                className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Координаты (широта)</span>
              <input
                value={draft.lat}
                onChange={(e) => set({ lat: e.target.value })}
                placeholder="18.2530"
                className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Координаты (долгота)</span>
              <input
                value={draft.lng}
                onChange={(e) => set({ lng: e.target.value })}
                placeholder="109.5236"
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
              disabled={sending}
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
