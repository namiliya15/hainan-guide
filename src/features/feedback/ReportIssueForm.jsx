import { useState } from 'react';
import { Send, X } from 'lucide-react';

export function ReportIssueForm({ open, place, onClose, onSubmit, needsEmail }) {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setSending(true);
    const ok = await onSubmit(place.id, { message, email });
    setSending(false);
    if (ok) setDone(true);
  }

  function handleClose() {
    setDone(false);
    setMessage('');
    setEmail('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[1150] grid place-items-center bg-ink/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-night-surface">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-ink dark:text-white">Сообщить об изменениях</h2>
          <button type="button" onClick={handleClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-sand-200 dark:text-white dark:hover:bg-night-surface2">
            <X size={19} />
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-500 dark:text-mist">{place?.name}</p>

        {done ? (
          <div className="py-4 text-center">
            <p className="mb-4 text-slate-600 dark:text-mist">Спасибо, передали администратору!</p>
            <button type="button" onClick={handleClose} className="rounded-lg bg-lagoon px-4 py-2.5 text-sm font-bold text-white hover:bg-lagoon-600 dark:bg-aqua dark:text-night">
              Готово
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="mb-3 block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Что изменилось или неверно?</span>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Например: место закрыто на реконструкцию / изменились часы работы / неверный адрес"
                className="min-h-24 w-full rounded-lg border border-sand-300 bg-white px-3 py-2 outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
              />
            </label>
            {needsEmail && (
              <label className="mb-3 block">
                <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Email (чтобы админ мог ответить)</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
                />
              </label>
            )}
            <button
              type="submit"
              disabled={sending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-lagoon px-4 py-2.5 font-bold text-white hover:bg-lagoon-600 disabled:opacity-60 dark:bg-aqua dark:text-night"
            >
              <Send size={15} />
              {sending ? 'Отправляем...' : 'Отправить'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
