import { useEffect, useState } from 'react';
import { hasSupabaseConfig, supabase } from '../lib/supabase';

// Раньше приложение требовало сессию для показа чего-либо вообще.
// Теперь главная страница публичная — session может быть null (гость),
// и это нормальное состояние, а не экран загрузки/логина.
export function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(hasSupabaseConfig);

  useEffect(() => {
    if (!hasSupabaseConfig) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signOut() {
    if (hasSupabaseConfig && !session?.localOnly) await supabase.auth.signOut();
    setSession(null);
  }

  return { session, setSession, loading, signOut };
}
