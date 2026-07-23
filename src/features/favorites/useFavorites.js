import { useEffect, useState } from 'react';
import { hasSupabaseConfig, supabase } from '../../lib/supabase';

const LOCAL_FAVORITES_KEY = 'hainan-guide-favorites';

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// onRequireAuth вызывается вместо переключения избранного, если пользователь
// не авторизован — по требованию: вкладка "Избранное" видна всем, но чтобы
// реально добавить туда место, нужно войти или зарегистрироваться.
export function useFavorites(session, onRequireAuth) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  async function loadFavorites() {
    if (!session) {
      setFavorites([]);
      return;
    }
    if (!hasSupabaseConfig || session.localOnly) {
      setFavorites(readJson(LOCAL_FAVORITES_KEY, []));
      return;
    }
    const { data } = await supabase.from('favorites').select('place_id').eq('user_id', session.user.id);
    setFavorites(data?.map((row) => row.place_id) || []);
  }

  async function toggleFavorite(placeId) {
    if (!session) {
      onRequireAuth?.();
      return;
    }
    const isFavorite = favorites.includes(placeId);
    const next = isFavorite ? favorites.filter((id) => id !== placeId) : [...favorites, placeId];
    setFavorites(next);

    if (!hasSupabaseConfig || session.localOnly) {
      writeJson(LOCAL_FAVORITES_KEY, next);
      return;
    }
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', session.user.id).eq('place_id', placeId);
    } else {
      await supabase.from('favorites').insert({ user_id: session.user.id, place_id: placeId });
    }
  }

  return { favorites, toggleFavorite };
}
