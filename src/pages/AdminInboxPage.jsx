import { useState } from 'react';
import { Check, Inbox, MessageSquare, X } from 'lucide-react';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { useFeedback } from '../features/feedback/useFeedback';

function ReplyBox({ initial, onSave, placeholder }) {
  const [value, setValue] = useState(initial || '');
  return (
    <div className="mt-2 flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-sand-300 px-3 py-1.5 text-sm outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
      />
      <button
        type="button"
        onClick={() => onSave(value)}
        className="rounded-lg bg-lagoon px-3 py-1.5 text-xs font-bold text-white hover:bg-lagoon-600 dark:bg-aqua dark:text-night"
      >
        Сохранить
      </button>
    </div>
  );
}

export function AdminInboxPage({ session }) {
  const isAdmin = useIsAdmin(session);
  const { adminSuggestions, adminReports, notice, approveSuggestion, rejectSuggestion, replySuggestion, resolveReport, replyReport } =
    useFeedback(session, isAdmin);

  if (!isAdmin) {
    return <div className="mx-auto max-w-md px-4 py-24 text-center text-slate-500 dark:text-mist">Эта страница доступна только администратору.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center gap-2">
        <Inbox className="text-lagoon dark:text-aqua" size={22} />
        <h1 className="font-display text-2xl font-medium text-ink dark:text-white">Входящие</h1>
      </div>

      {notice && <div className="mb-4 rounded-lg bg-lagoon/10 px-4 py-2.5 text-sm font-semibold text-lagoon-600 dark:text-aqua">{notice}</div>}

      <h2 className="mb-3 font-display text-lg font-semibold text-ink dark:text-white">
        Предложенные места {adminSuggestions.filter((s) => s.status === 'pending').length > 0 && `(${adminSuggestions.filter((s) => s.status === 'pending').length} новых)`}
      </h2>
      {adminSuggestions.length === 0 && <p className="mb-8 text-sm text-slate-400">Пока пусто.</p>}
      <div className="mb-10 flex flex-col gap-3">
        {adminSuggestions.map((s) => (
          <div key={s.id} className="rounded-xl border border-sand-300 bg-white p-4 dark:border-night-surface2 dark:bg-night-surface">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-display text-base font-semibold text-ink dark:text-white">{s.name}</p>
                <p className="text-xs text-slate-400">
                  {s.category} {s.chinese_address && `· ${s.chinese_address}`}
                </p>
                {s.submitted_email && <p className="text-xs text-slate-400">от {s.submitted_email}</p>}
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  s.status === 'pending'
                    ? 'bg-amber-100 text-amber-700'
                    : s.status === 'approved'
                      ? 'bg-lagoon/10 text-lagoon-600 dark:text-aqua'
                      : 'bg-red-100 text-red-600'
                }`}
              >
                {s.status === 'pending' ? 'Новое' : s.status === 'approved' ? 'Опубликовано' : 'Отклонено'}
              </span>
            </div>
            {s.description && <p className="mt-2 text-sm text-slate-600 dark:text-mist">{s.description}</p>}
            {s.note && <p className="mt-1 text-sm italic text-slate-400">Заметка: {s.note}</p>}

            {s.status === 'pending' && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-sand-200 pt-3 dark:border-night-surface2">
                <button
                  type="button"
                  onClick={() => approveSuggestion(s)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-lagoon px-3 py-1.5 text-xs font-bold text-white hover:bg-lagoon-600 dark:bg-aqua dark:text-night"
                >
                  <Check size={13} />
                  Опубликовать
                </button>
                <button
                  type="button"
                  onClick={() => rejectSuggestion(s.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-sand-300 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-sand-200 dark:border-night-surface2 dark:text-mist dark:hover:bg-night-surface2"
                >
                  <X size={13} />
                  Отклонить
                </button>
              </div>
            )}
            <ReplyBox initial={s.admin_reply} onSave={(reply) => replySuggestion(s.id, reply)} placeholder="Задать вопрос автору / оставить ответ..." />
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold text-ink dark:text-white">
        Сообщения об изменениях {adminReports.filter((r) => r.status === 'pending').length > 0 && `(${adminReports.filter((r) => r.status === 'pending').length} новых)`}
      </h2>
      {adminReports.length === 0 && <p className="text-sm text-slate-400">Пока пусто.</p>}
      <div className="flex flex-col gap-3">
        {adminReports.map((r) => (
          <div key={r.id} className="rounded-xl border border-sand-300 bg-white p-4 dark:border-night-surface2 dark:bg-night-surface">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <MessageSquare size={14} className="text-slate-400" />
                <p className="font-semibold text-ink dark:text-white">{r.places?.name || 'Место удалено'}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-lagoon/10 text-lagoon-600 dark:text-aqua'
                }`}
              >
                {r.status === 'pending' ? 'Новое' : 'Решено'}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-mist">{r.message}</p>
            {r.submitted_email && <p className="mt-1 text-xs text-slate-400">от {r.submitted_email}</p>}
            {r.status === 'pending' && (
              <button
                type="button"
                onClick={() => resolveReport(r.id)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-lagoon px-3 py-1.5 text-xs font-bold text-white hover:bg-lagoon-600 dark:bg-aqua dark:text-night"
              >
                <Check size={13} />
                Отметить решённым
              </button>
            )}
            <ReplyBox initial={r.admin_reply} onSave={(reply) => replyReport(r.id, reply)} placeholder="Ответить автору..." />
          </div>
        ))}
      </div>
    </div>
  );
}
