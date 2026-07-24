import { useIsAdmin } from '../hooks/useIsAdmin';
import { useFeedback } from '../features/feedback/useFeedback';

const STATUS_LABEL = {
  pending: 'На проверке',
  approved: 'Опубликовано',
  rejected: 'Отклонено',
  resolved: 'Решено',
};

export function MySubmissionsPage({ session }) {
  const isAdmin = useIsAdmin(session);
  const { mySuggestions, myReports } = useFeedback(session, isAdmin);

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
                {s.admin_reply && (
                  <p className="mt-2 rounded-lg bg-lagoon/10 px-3 py-2 text-sm text-lagoon-600 dark:text-aqua">Ответ администратора: {s.admin_reply}</p>
                )}
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
                {r.admin_reply && (
                  <p className="mt-2 rounded-lg bg-lagoon/10 px-3 py-2 text-sm text-lagoon-600 dark:text-aqua">Ответ администратора: {r.admin_reply}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
