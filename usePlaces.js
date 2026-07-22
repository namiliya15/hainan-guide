import { useEffect, useMemo, useState } from 'react';
import { hasSupabaseConfig, supabase } from '../../lib/supabase';
import { samplePlaces } from '../../data/samplePlaces';

const LOCAL_PLACES_KEY = 'hainan-guide-places';

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

export function emptyDraft() {
  return {
    name: '',
    chinese_name: '',
    chinese_address: '',
    category: 'Рестораны и кафе',
    photos: null,
    description: '',
    working_hours: '',
    price_info: '',
    extra_info: '',
    lat: '',
    lng: '',
    amap_url: '',
    trip_url: '',
  };
}

// Места теперь грузятся независимо от того, есть сессия или нет —
// главная страница публичная, и гость должен видеть все места сразу.
// Если Supabase настроен — читаем из БД (публичное чтение таблицы places).
// Если нет — работаем с локальным набором (localStorage или демо-данные).
export function usePlaces(session) {
  const [places, setPlaces] = useState([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    loadPlaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPlaces() {
    if (!hasSupabaseConfig) {
      const local = readJson(LOCAL_PLACES_KEY, samplePlaces);
      setPlaces(local);
      return;
    }
    const { data } = await supabase.from('places').select('*').order('created_at', { ascending: false });
    setPlaces(data || []);
  }

  function showNotice(text) {
    setNotice(text);
    setTimeout(() => setNotice(''), 2500);
  }

  // Полнотекстовый поиск — уже сейчас ищет по ВСЕМ местам сразу,
  // независимо от выбранной категории (искали среди всех полей: название,
  // китайское название, адрес, описание, категория).
  function searchAll(query) {
    if (!query.trim()) return null;
    const terms = query.toLowerCase().trim().split(/\s+/);
    return places.filter((place) => {
      const haystack = [place.name, place.chinese_name, place.chinese_address, place.description, place.extra_info, place.category]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }

  async function uploadPlaceImage(file) {
    if (!hasSupabaseConfig) return null;
    const tempId = crypto.randomUUID();
    const fileExt = file.name.split('.').pop();
    const filePath = `place-photos/${tempId}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage.from('place-images').upload(filePath, file);
    if (error) {
      showNotice('Ошибка загрузки фото: ' + error.message);
      return null;
    }
    const { data } = supabase.storage.from('place-images').getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function addPlace(draft, userId) {
    const place = {
      id: crypto.randomUUID(),
      name: draft.name.trim(),
      chinese_name: draft.chinese_name?.trim() || '',
      chinese_address: draft.chinese_address?.trim() || null,
      category: draft.category,
      description: draft.description?.trim() || null,
      working_hours: draft.working_hours?.trim() || null,
      price_info: draft.price_info?.trim() || null,
      extra_info: draft.extra_info?.trim() || null,
      photos: draft.photos || null,
      lat: draft.lat ? Number(draft.lat) : null,
      lng: draft.lng ? Number(draft.lng) : null,
      amap_url: draft.amap_url?.trim() || null,
      trip_url: draft.trip_url?.trim() || null,
      is_public: true,
      user_id: userId,
    };
    setPlaces((current) => [place, ...current]);

    if (!hasSupabaseConfig) {
      writeJson(LOCAL_PLACES_KEY, [place, ...places]);
      showNotice('Место сохранено локально.');
      return;
    }
    const { error } = await supabase.from('places').insert(place);
    showNotice(error ? error.message : 'Место добавлено.');
  }

  async function updatePlace(placeId, draft) {
    const patch = {
      name: draft.name.trim(),
      chinese_name: draft.chinese_name?.trim() || '',
      chinese_address: draft.chinese_address?.trim() || null,
      category: draft.category,
      description: draft.description?.trim() || null,
      working_hours: draft.working_hours?.trim() || null,
      price_info: draft.price_info?.trim() || null,
      extra_info: draft.extra_info?.trim() || null,
      photos: draft.photos || null,
      lat: draft.lat ? Number(draft.lat) : null,
      lng: draft.lng ? Number(draft.lng) : null,
      amap_url: draft.amap_url?.trim() || null,
      trip_url: draft.trip_url?.trim() || null,
    };
    const next = places.map((p) => (p.id === placeId ? { ...p, ...patch } : p));
    setPlaces(next);

    if (!hasSupabaseConfig) {
      writeJson(LOCAL_PLACES_KEY, next);
      showNotice('Место обновлено локально.');
      return;
    }
    const { error } = await supabase.from('places').update(patch).eq('id', placeId);
    showNotice(error ? error.message : 'Место обновлено.');
  }

  async function deletePlace(placeId) {
    if (!confirm('Вы уверены, что хотите удалить это место?')) return;
    const next = places.filter((p) => p.id !== placeId);
    setPlaces(next);

    if (!hasSupabaseConfig) {
      writeJson(LOCAL_PLACES_KEY, next);
      showNotice('Место удалено локально.');
      return;
    }
    const { error } = await supabase.from('places').delete().eq('id', placeId);
    showNotice(error ? error.message : 'Место удалено.');
  }

  async function updatePlaceCoordinates(placeId, lat, lng) {
    const next = places.map((p) => (p.id === placeId ? { ...p, lat, lng } : p));
    setPlaces(next);
    if (!hasSupabaseConfig) {
      writeJson(LOCAL_PLACES_KEY, next);
      return;
    }
    const { error } = await supabase.from('places').update({ lat, lng, updated_at: new Date() }).eq('id', placeId);
    showNotice(error ? 'Ошибка обновления координат' : 'Координаты обновлены');
  }

  async function deleteImageFromPlace(placeId, imageIndex) {
    const place = places.find((p) => p.id === placeId);
    if (!place) return;
    let photos = [];
    try {
      photos = typeof place.photos === 'string' ? JSON.parse(place.photos) : place.photos || [];
    } catch {
      photos = [];
    }
    photos.splice(imageIndex, 1);
    const updatedPhotos = photos.length > 0 ? JSON.stringify(photos) : null;
    const next = places.map((p) => (p.id === placeId ? { ...p, photos: updatedPhotos } : p));
    setPlaces(next);

    if (!hasSupabaseConfig) {
      writeJson(LOCAL_PLACES_KEY, next);
      showNotice('Фото удалено локально');
      return;
    }
    const { error } = await supabase.from('places').update({ photos: updatedPhotos }).eq('id', placeId);
    showNotice(error ? 'Ошибка удаления фото' : 'Фото удалено');
  }

  return {
    places,
    notice,
    clearNotice: () => setNotice(''),
    searchAll,
    addPlace,
    updatePlace,
    deletePlace,
    updatePlaceCoordinates,
    deleteImageFromPlace,
    uploadPlaceImage,
  };
}
