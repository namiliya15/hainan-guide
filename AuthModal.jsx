import { useState } from 'react';
import { Compass, RefreshCw, User, X } from 'lucide-react';
import { hasSupabaseConfig, supabase } from '../../lib/supabase';

function makeTempUser() {
  return { id: 'local-user', email: 'offline@hainan.guide' };
}

// reason — необязательный текст, который показывается над формой.
// Используется, когда модалка открыта не из шапки, а как реакция на
// попытку неавторизованного пользователя добавить место в избранное.
export function AuthModal({ open, onClose, onSession, reason }) {
  const [mode, setMode] = useState('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  if (!open) return null;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    if (!hasSupabaseConfig) {
      onSession({ user: makeTempUser(), localOnly: true });
      setBusy(false);
      onClose();
      return;
    }

    const action =
      mode === 'signUp'
        ? supabase.auth.signUp({ email, password })
        : supabase.auth.signInWithPassword({ email, password });
    const { data, error } = await action;
    if (error) {
      setMessage(error.message);
    } else if (data.session) {
      onSession(data.session);
      onClose();
    } else {
      setMessage('Проверьте почту для подтверждения регистрации, затем войдите.');
    }
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-ink/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-night-surface">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-lagoon text-white dark:bg-aqua dark:text-night">
              <User size={18} />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-ink dark:text-white">
                {mode === 'signUp' ? 'Создать аккаунт' : 'Вход'}
              </h2>
              {!reason && (
                <p className="text-xs text-slate-500 dark:text-mist">
                  {hasSupabaseConfig ? 'Email и пароль' : 'Локальный демо-режим'}
                </p>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-sand-200 dark:text-white dark:hover:bg-night-surface2">
            <X size={19} />
          </button>
        </div>

        {reason && (
          <p className="mb-4 rounded-lg bg-coral/10 px-3 py-2 text-sm font-medium text-coral-600 dark:text-coral">
            {reason}
          </p>
        )}

        <form onSubmit={submit}>
          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Email</span>
            <input
              className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required={hasSupabaseConfig}
            />
          </label>
          <label className="mb-4 block">
            <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-mist">Пароль</span>
            <input
              className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/20 dark:border-night-surface2 dark:bg-night-surface2 dark:text-white"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Не менее 6 символов"
              required={hasSupabaseConfig}
              minLength={hasSupabaseConfig ? 6 : undefined}
            />
          </label>
          {message && <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{message}</p>}
          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-lagoon px-4 py-3 font-bold text-white hover:bg-lagoon-600 disabled:opacity-60 dark:bg-aqua dark:text-night"
          >
            {busy ? <RefreshCw className="animate-spin" size={18} /> : <Compass size={18} />}
            {mode === 'signUp' ? 'Создать аккаунт' : hasSupabaseConfig ? 'Войти' : 'Открыть локальную демку'}
          </button>
          <button
            type="button"
            className="mt-3 w-full rounded-lg px-4 py-2 text-sm font-semibold text-lagoon hover:bg-sand-200 dark:text-aqua dark:hover:bg-night-surface2"
            onClick={() => setMode(mode === 'signUp' ? 'signIn' : 'signUp')}
          >
            {mode === 'signUp' ? 'Уже есть аккаунт? Войти' : 'Нужен аккаунт? Зарегистрироваться'}
          </button>
        </form>
      </div>
    </div>
  );
}
