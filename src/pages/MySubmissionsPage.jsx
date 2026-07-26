import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { useFeedback } from '../features/feedback/useFeedback';

const STATUS_LABEL = {
  pending: 'На проверке',
  approved: 'Опубликовано',
  rejected: 'Отклонено',
  resolved: 'Решено',
};

function ReplyThread({ item, itemType, onReply }) {
  const [value, setValue] = useState(item.user_reply || '');
  const [editing, setEditing] = useState(!item.user_reply);
  const [sending, setSending] = useState(false);

  if (!item.admin_reply) return null;

  async function handleSend() {
    if (!value.trim()) return;
    setSending(true);
    await onReply(itemType, item.id, value.trim());
    setSending(false);
    setEditing(false);
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <p className="rounded-lg bg-lagoon/10 px-3 py-2 text-sm text-lagoon-600 dark:text-aqua">Администратор: {item.admin_reply}</p>

      {!editing && item.user_reply && (
        <div className="flex items-start justify-between gap-2 rounded-lg bg-sand-200 px-3 py-2 dark:bg-night-surface2">
          <p className="text-sm text-slate-600 dark:text-mist">Вы: {item.user_reply}</p>
          <button type="button" onClick={() => setEditing(true)} className="shrink-0 text-xs font-bold text-lagoon dark:text-aqua">
            Изменить
          </button>
        </div>
      )}

      {editing && (
        <div className="flex gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ваш ответ администратору..."
            className="flex-1 rounded-lg border border-sand-300 px-3 py-1.5 text-sm outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !value.trim()}
            className="inline-flex items-center gap-1 rounded-lg bg-lagoon px-3 py-1.5 text-xs font-bold text-white hover:bg-lagoon-600 disabled:opacity-60 dark:bg-aqua dark:text-night"
          >
            <Send size={13} />
            Отправить
          </button>
        </div>
      )}
    </div>
  );
}

export function MySubmissionsPage({ session, onSeen }) {
  const isAdmin = useIsAdmin(session);
  const { mySuggestions, myReports, submitUserReply } = useFeedback(session, isAdmin);

  // Отмечаем ответы прочитанными при заходе на страницу — это обновляет
  // счётчик-точку у колокольчика в шапке (там отдельный экземпляр хука,
  // поэтому используем именно ту функцию, что пришла из App, а не свою).
  useEffect(() => {
    if (session) onSeen?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  if (!session) {
    return <div className="mx-auto max-w-md px-4 py-24 text-center text-slate-500 dark:text-mist">Войдите в аккаунт, чтобы увидеть свои предложения.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-display text-2xl font-medium text-ink dark:text-white">Мои предложения</h1>

      {mySuggestions.length === 0 && myReports.length === 0 && (
        <p className="text-slate-500 dark:text-mist">Ты пока ничего не предлагала — сделать это можно с главной страницы, под картой.</p>
      )}

      {mySuggestions.length > 0 && (
        <>
          <h2 className="mb-2 mt-4 text-sm font-bold uppercase tracking-wide text-slate-400">Предложенные места</h2>
          <div className="mb-6 flex flex-col gap-3">
            {mySuggestions.map((s) => (
              <div key={s.id} className="rounded-xl border border-sand-300 bg-white p-4 dark:border-night-surface2 dark:bg-night-surface">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-ink dark:text-white">{s.name}</p>
                  <span className="shrink-0 rounded-full bg-sand-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-night-surface2 dark:text-mist">
                    {STATUS_LABEL[s.status]}
                  </span>
                </div>
                <ReplyThread item={s} itemType="suggestion" onReply={submitUserReply} />
              </div>
            ))}
          </div>
        </>
      )}

      {myReports.length > 0 && (
        <>
          <h2 className="mb-2 mt-4 text-sm font-bold uppercase tracking-wide text-slate-400">Сообщения об изменениях</h2>
          <div className="flex flex-col gap-3">
            {myReports.map((r) => (
              <div key={r.id} className="rounded-xl border border-sand-300 bg-white p-4 dark:border-night-surface2 dark:bg-night-surface">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-slate-600 dark:text-mist">{r.message}</p>
                  <span className="shrink-0 rounded-full bg-sand-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-night-surface2 dark:text-mist">
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
                <ReplyThread item={r} itemType="report" onReply={submitUserReply} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
