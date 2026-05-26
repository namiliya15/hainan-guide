import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Compass,
  GripVertical,
  Heart,
  HeartOff,
  LogOut,
  MapPin,
  Navigation,
  Plus,
  RefreshCw,
  Star,
  User,
  WifiOff,
  X,
  Copy,
  Edit,
  Trash2,
  Check,
  Search,
  Move,
} from 'lucide-react';
import { defaultCategories } from './data/categories';
import { samplePlaces } from './data/samplePlaces';
import { hasSupabaseConfig, supabase } from './lib/supabase';

const LOCAL_PLACES_KEY = 'hainan-guide-places';
const LOCAL_FAVORITES_KEY = 'hainan-guide-favorites';
const LOCAL_CATEGORY_KEY = 'hainan-guide-category-order';
const SANYA_CENTER = [18.2218, 109.515];

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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

function makeTempUser() {
  return { id: 'local-user', email: 'offline@hainan.guide' };
}

function SortableCategory({ category, activeCategory, count, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const active = activeCategory === category;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg border px-2 py-2 shadow-sm transition ${
        active ? 'border-reef bg-teal-50' : 'border-slate-200 bg-white'
      } ${isDragging ? 'opacity-70' : ''}`}
    >
      <button
        type="button"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
        aria-label={`Перетащить ${category}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={17} />
      </button>
      <button
        type="button"
        onClick={() => onSelect(category)}
        className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left"
      >
        <span className="truncate text-sm font-semibold text-slate-800">{category}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{count}</span>
      </button>
    </div>
  );
}

function AuthPanel({ onSession }) {
  const [mode, setMode] = useState('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    if (!hasSupabaseConfig) {
      onSession({ user: makeTempUser(), localOnly: true });
      setBusy(false);
      return;
    }

    const action =
      mode === 'signUp'
        ? supabase.auth.signUp({ email, password })
        : supabase.auth.signInWithPassword({ email, password });
    const { data, error } = await action;
    if (error) setMessage(error.message);
    else if (data.session) onSession(data.session);
    else setMessage('Проверьте почту для подтверждения регистрации, затем войдите.');
    setBusy(false);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-4 py-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-1 text-sm font-semibold text-reef">
            <Compass size={16} />
            Дадунхай, Санья
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-6xl">
              Путеводитель по Хайнаню: пляжи, еда, отели и тихие уголки.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Сохраняйте избранное, добавляйте свои места, меняйте порядок меню и пользуйтесь гидом офлайн.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950">{mode === 'signUp' ? 'Создать аккаунт' : 'Вход'}</h2>
              <p className="text-sm text-slate-500">
                {hasSupabaseConfig ? 'Используйте email и пароль Supabase.' : 'Переменные Supabase не заданы, будет открыт локальный демо-режим.'}
              </p>
            </div>
            <User className="text-reef" />
          </div>
          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Email</span>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-reef focus:ring-2 focus:ring-teal-100"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required={hasSupabaseConfig}
            />
          </label>
          <label className="mb-4 block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Пароль</span>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-reef focus:ring-2 focus:ring-teal-100"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Не менее 6 символов"
              required={hasSupabaseConfig}
              minLength={hasSupabaseConfig ? 6 : undefined}
            />
          </label>
          {message && <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{message}</p>}
          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-reef px-4 py-3 font-bold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {busy ? <RefreshCw className="animate-spin" size={18} /> : <Navigation size={18} />}
            {mode === 'signUp' ? 'Создать аккаунт' : hasSupabaseConfig ? 'Войти' : 'Открыть локальную демку'}
          </button>
          <button
            type="button"
            className="mt-3 w-full rounded-lg px-4 py-2 text-sm font-semibold text-reef hover:bg-teal-50"
            onClick={() => setMode(mode === 'signUp' ? 'signIn' : 'signUp')}
          >
            {mode === 'signUp' ? 'Уже есть аккаунт?' : 'Нужен аккаунт?'}
          </button>
        </form>
      </section>
    </main>
  );
}

// Компонент для редактирования координат на карте (только для админа)
function DraggableMarker({ place, onPositionChange }) {
  const [position, setPosition] = useState([place.lat, place.lng]);
  
  const eventHandlers = useMemo(() => ({
    dragend(event) {
      const marker = event.target;
      const newLat = marker.getLatLng().lat;
      const newLng = marker.getLatLng().lng;
      setPosition([newLat, newLng]);
      onPositionChange(place.id, newLat, newLng);
    },
  }), [place.id, onPositionChange]);

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={eventHandlers}
    >
      <Popup>
        <div className="text-sm">
          <strong>{place.name}</strong>
          <br />
          <span className="text-xs text-gray-500">Перетащите маркер, чтобы изменить положение</span>
        </div>
      </Popup>
    </Marker>
  );
}

function PlaceCard({ place, favorite, onFavorite, onShowMap, onEdit, onDelete }) {
  const [copiedName, setCopiedName] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAdmin(user?.email === 'namiliya15@gmail.com');
    };
    checkAdmin();
  }, []);
  
  const amapUrl = place.amap_url || (place.lat && place.lng ? `https://uri.amap.com/marker?position=${place.lng},${place.lat}&name=${encodeURIComponent(place.chinese_name || place.name)}` : null);
  
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'name') {
        setCopiedName(true);
        setTimeout(() => setCopiedName(false), 2000);
      } else {
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
      }
    } catch (err) {
      console.error('Ошибка копирования:', err);
    }
  };
  
  // Форматирование описания: заменяем переносы строк на <br>
  const formattedDescription = place.description?.split('\n').map((line, i) => (
    <span key={i}>
      {line}
      {i < place.description.split('\n').length - 1 && <br />}
    </span>
  ));
  
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm group relative">
      {place.photo_url && (
        <img src={place.photo_url} alt={place.name} className="h-44 w-full object-cover" loading="lazy" />
      )}
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-hibiscus">{place.category}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="truncate text-lg font-black text-slate-950">{place.name}</h3>
            </div>
            {place.chinese_name && (
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-sm font-semibold text-slate-500">{place.chinese_name}</p>
                <button
                  onClick={() => copyToClipboard(place.chinese_name, 'name')}
                  className="text-slate-400 hover:text-reef transition"
                  title="Копировать китайское название"
                >
                  {copiedName ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            )}
            {place.chinese_address && (
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-xs text-slate-400">{place.chinese_address}</p>
                <button
                  onClick={() => copyToClipboard(place.chinese_address, 'address')}
                  className="text-slate-400 hover:text-reef transition"
                  title="Копировать адрес"
                >
                  {copiedAddress ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            )}
            {!place.lat && !place.lng && (
              <p className="text-xs text-amber-500 mt-1">⚠️ Без координат — не отображается на карте</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onFavorite(place.id)}
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${
                favorite ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
              aria-label={favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
            >
              {favorite ? <Heart size={18} fill="currentColor" /> : <HeartOff size={18} />}
            </button>
          </div>
        </div>
        {place.description && (
          <div className="text-sm leading-6 text-slate-600">
            {formattedDescription}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {amapUrl && (
            <a
              href={amapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-reef px-3 py-2 text-sm font-bold text-white hover:bg-teal-800"
            >
              <Navigation size={16} />
              Открыть в Amap
            </a>
          )}
          {place.lat && place.lng && (
            <button
              type="button"
              onClick={() => onShowMap(place)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <MapPin size={16} />
              Показать на карте
            </button>
          )}
          {place.trip_url && (
            <a
              href={place.trip_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              <Compass size={16} />
              Открыть на Trip.com
            </a>
          )}
        </div>
        
        {isAdmin && (
          <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
            <button
              onClick={() => onEdit(place)}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-reef transition"
            >
              <Edit size={14} />
              Редактировать
            </button>
            <button
              onClick={() => onDelete(place.id)}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 transition"
            >
              <Trash2 size={14} />
              Удалить
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function AddPlaceForm({ draft, categories, onChange, onSubmit, onClose, isEditing }) {
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-950/50 p-4">
      <form onSubmit={onSubmit} className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-slate-950">{isEditing ? 'Редактировать место' : 'Добавить место'}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100">
            <X size={19} />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Название" value={draft.name} onChange={(value) => onChange({ name: value })} required />
          <Input label="Китайское название" value={draft.chinese_name} onChange={(value) => onChange({ chinese_name: value })} />
          <div className="sm:col-span-2">
            <Input 
              label="Адрес" 
              value={draft.chinese_address || ''} 
              onChange={(value) => onChange({ chinese_address: value })} 
              placeholder="Китайский или английский адрес"
            />
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Категория</span>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-reef focus:ring-2 focus:ring-teal-100"
              value={draft.category}
              onChange={(event) => onChange({ category: event.target.value })}
            >
              {categories.filter((category) => category !== 'Избранное').map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <Input label="URL фото" value={draft.photo_url || ''} onChange={(value) => onChange({ photo_url: value })} />
          <Input label="Ссылка Amap" value={draft.amap_url || ''} onChange={(value) => onChange({ amap_url: value })} placeholder="https://uri.amap.com/marker?position=109.515,18.2218" />
          <Input label="Ссылка Trip.com" value={draft.trip_url || ''} onChange={(value) => onChange({ trip_url: value })} />
        </div>
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Описание</span>
          <textarea
            className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-reef focus:ring-2 focus:ring-teal-100"
            value={draft.description || ''}
            onChange={(event) => onChange({ description: event.target.value })}
            placeholder="Для переноса строки нажмите Enter"
          />
        </label>
        {draft.lat && draft.lng ? (
          <p className="mt-2 text-xs text-green-600">
            ✓ Координаты: {draft.lat}, {draft.lng}
          </p>
        ) : (
          <p className="mt-2 text-xs text-amber-600">
            💡 Координаты не заданы. Место не будет отображаться на карте.
            <br />
            • Кликните на карту, чтобы добавить координаты
          </p>
        )}
        <button 
          type="submit" 
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-reef px-4 py-3 font-bold text-white hover:bg-teal-800"
        >
          <Plus size={18} />
          {isEditing ? 'Сохранить изменения' : 'Сохранить место'}
        </button>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-reef focus:ring-2 focus:ring-teal-100"
        type={type}
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </label>
  );
}

function MapClickHandler({ onPick }) {
  useMapEvents({
    click(event) {
      if (onPick) {
        onPick(event.latlng);
      }
    },
  });
  return null;
}

function MapFocus({ place }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (place && map && place.lat && place.lng) {
      map.setView([place.lat, place.lng], 15, { animate: true });
    }
  }, [map, place]);
  return null;
}

function GuideApp({ session, onSignOut }) {
  const user = session.user;
  const [places, setPlaces] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [categoryOrder, setCategoryOrder] = useState(defaultCategories);
  const [activeCategory, setActiveCategory] = useState('Избранное');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlaceId, setEditingPlaceId] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [notice, setNotice] = useState('');
  const [draft, setDraft] = useState(() => emptyDraft());
  const [isAdmin, setIsAdmin] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // Проверка на администратора
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setIsAdmin(currentUser?.email === 'namiliya15@gmail.com');
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    loadData();
  }, [user.id]);

  async function loadData() {
    if (!hasSupabaseConfig || session.localOnly) {
      const localPlaces = readJson(LOCAL_PLACES_KEY, []);
      setPlaces(localPlaces);
      setFavorites(readJson(LOCAL_FAVORITES_KEY, []));
      setCategoryOrder(readJson(LOCAL_CATEGORY_KEY, defaultCategories));
      return;
    }

    const [{ data: remotePlaces }, { data: remoteFavorites }, { data: profile }] = await Promise.all([
      supabase.from('places').select('*').order('created_at', { ascending: false }),
      supabase.from('favorites').select('place_id').eq('user_id', user.id),
      supabase.from('profiles').select('category_order').eq('id', user.id).maybeSingle(),
    ]);
    setPlaces(remotePlaces || []);
    setFavorites(remoteFavorites?.map((row) => row.place_id) || []);
    setCategoryOrder(profile?.category_order?.length ? profile.category_order : defaultCategories);
  }

  // Функция для обновления координат места (только для админа)
  async function updatePlaceCoordinates(placeId, lat, lng) {
    if (!isAdmin) return;
    
    const { error } = await supabase
      .from('places')
      .update({ lat, lng, updated_at: new Date() })
      .eq('id', placeId);
    
    if (error) {
      console.error('Ошибка обновления координат:', error);
      setNotice('Ошибка обновления координат');
    } else {
      setPlaces(places.map(p => p.id === placeId ? { ...p, lat, lng } : p));
      setNotice('Координаты обновлены');
      setTimeout(() => setNotice(''), 2000);
    }
  }

  // Фильтрация по категории и поиску
  const filteredByCategory = useMemo(() => {
    if (activeCategory === 'Избранное') return places.filter((place) => favorites.includes(place.id));
    return places.filter((place) => place.category === activeCategory);
  }, [activeCategory, favorites, places]);

  // Поиск по всем полям (название, китайское название, адрес, описание)
  const visiblePlaces = useMemo(() => {
    if (!searchQuery.trim()) return filteredByCategory;
    
    const query = searchQuery.toLowerCase().trim();
    return filteredByCategory.filter((place) => {
      return (
        place.name?.toLowerCase().includes(query) ||
        place.chinese_name?.toLowerCase().includes(query) ||
        place.chinese_address?.toLowerCase().includes(query) ||
        place.description?.toLowerCase().includes(query) ||
        place.category?.toLowerCase().includes(query)
      );
    });
  }, [filteredByCategory, searchQuery]);

  const counts = useMemo(() => {
    return categoryOrder.reduce((acc, category) => {
      acc[category] = category === 'Избранное'
        ? favorites.length
        : places.filter((place) => place.category === category).length;
      return acc;
    }, {});
  }, [categoryOrder, favorites, places]);

  async function toggleFavorite(placeId) {
    const favorite = favorites.includes(placeId);
    const next = favorite ? favorites.filter((id) => id !== placeId) : [...favorites, placeId];
    setFavorites(next);

    if (!hasSupabaseConfig || session.localOnly) {
      writeJson(LOCAL_FAVORITES_KEY, next);
      return;
    }
    if (favorite) await supabase.from('favorites').delete().eq('user_id', user.id).eq('place_id', placeId);
    else await supabase.from('favorites').insert({ user_id: user.id, place_id: placeId });
  }

  async function saveCategoryOrder(nextOrder) {
    setCategoryOrder(nextOrder);
    if (!hasSupabaseConfig || session.localOnly) {
      writeJson(LOCAL_CATEGORY_KEY, nextOrder);
      return;
    }
    await supabase.from('profiles').upsert({ id: user.id, email: user.email, category_order: nextOrder });
  }

  async function addPlace(event) {
    event.preventDefault();
    
    const place = {
      id: crypto.randomUUID(),
      name: draft.name.trim(),
      chinese_name: draft.chinese_name?.trim() || '',
      chinese_address: draft.chinese_address?.trim() || null,
      category: draft.category,
      description: draft.description?.trim() || null,
      photo_url: draft.photo_url?.trim() || null,
      lat: draft.lat ? Number(draft.lat) : null,
      lng: draft.lng ? Number(draft.lng) : null,
      amap_url: draft.amap_url?.trim() || null,
      trip_url: draft.trip_url?.trim() || null,
      is_public: true,
      user_id: user.id,
    };

    const nextPlaces = [place, ...places];
    setPlaces(nextPlaces);
    setShowForm(false);
    setDraft(emptyDraft());
    setActiveCategory(place.category);

    if (!hasSupabaseConfig || session.localOnly) {
      const ownPlaces = readJson(LOCAL_PLACES_KEY, []);
      writeJson(LOCAL_PLACES_KEY, [place, ...ownPlaces]);
      setNotice('Место сохранено локально.');
      return;
    }

    const { error } = await supabase.from('places').insert(place);
    setNotice(error ? error.message : 'Место добавлено.');
  }

  async function updatePlace(event) {
    event.preventDefault();
    
    const updatedPlace = {
      name: draft.name.trim(),
      chinese_name: draft.chinese_name?.trim() || '',
      chinese_address: draft.chinese_address?.trim() || null,
      category: draft.category,
      description: draft.description?.trim() || null,
      photo_url: draft.photo_url?.trim() || null,
      lat: draft.lat ? Number(draft.lat) : null,
      lng: draft.lng ? Number(draft.lng) : null,
      amap_url: draft.amap_url?.trim() || null,
      trip_url: draft.trip_url?.trim() || null,
    };

    const updatedPlaces = places.map(place => 
      place.id === editingPlaceId ? { ...place, ...updatedPlace } : place
    );
    setPlaces(updatedPlaces);
    setShowForm(false);
    setIsEditing(false);
    setEditingPlaceId(null);
    setDraft(emptyDraft());

    if (!hasSupabaseConfig || session.localOnly) {
      writeJson(LOCAL_PLACES_KEY, updatedPlaces);
      setNotice('Место обновлено локально.');
      return;
    }

    const { error } = await supabase.from('places').update(updatedPlace).eq('id', editingPlaceId);
    setNotice(error ? error.message : 'Место обновлено.');
  }

  async function deletePlace(placeId) {
    if (!confirm('Вы уверены, что хотите удалить это место?')) return;
    
    const updatedPlaces = places.filter(place => place.id !== placeId);
    setPlaces(updatedPlaces);
    
    if (favorites.includes(placeId)) {
      const updatedFavorites = favorites.filter(id => id !== placeId);
      setFavorites(updatedFavorites);
      if (!hasSupabaseConfig || session.localOnly) {
        writeJson(LOCAL_FAVORITES_KEY, updatedFavorites);
      } else {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('place_id', placeId);
      }
    }

    if (!hasSupabaseConfig || session.localOnly) {
      writeJson(LOCAL_PLACES_KEY, updatedPlaces);
      setNotice('Место удалено локально.');
      return;
    }

    const { error } = await supabase.from('places').delete().eq('id', placeId);
    setNotice(error ? error.message : 'Место удалено.');
  }

  function editPlace(place) {
    setDraft({
      name: place.name || '',
      chinese_name: place.chinese_name || '',
      chinese_address: place.chinese_address || '',
      category: place.category || 'Рестораны и кафе',
      photo_url: place.photo_url || '',
      description: place.description || '',
      lat: place.lat?.toString() || '',
      lng: place.lng?.toString() || '',
      amap_url: place.amap_url || '',
      trip_url: place.trip_url || '',
    });
    setIsEditing(true);
    setEditingPlaceId(place.id);
    setShowForm(true);
  }

  function beginMapAdd(latlng) {
    setDraft({ 
      ...emptyDraft(), 
      lat: latlng.lat.toFixed(6), 
      lng: latlng.lng.toFixed(6) 
    });
    setIsEditing(false);
    setEditingPlaceId(null);
    setShowForm(true);
  }

  function openPlaceOnMap(place) {
    if (place.lat && place.lng) {
      setSelectedPlace(place);
      document.getElementById('global-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function handleCloseForm() {
    setShowForm(false);
    setIsEditing(false);
    setEditingPlaceId(null);
    setDraft(emptyDraft());
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-reef text-white">
              <Compass size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-black text-slate-950">Путеводитель по Хайнаню</h1>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!hasSupabaseConfig && (
              <span className="hidden items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 sm:inline-flex">
                <WifiOff size={14} />
                Локальная демка
              </span>
            )}
            {user.email === 'namiliya15@gmail.com' && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingPlaceId(null);
                  setDraft(emptyDraft());
                  setShowForm(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-reef px-3 py-2 text-sm font-bold text-white hover:bg-teal-800"
              >
                <Plus size={17} />
                Добавить
              </button>
            )}
            <button
              type="button"
              onClick={onSignOut}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
              aria-label="Выйти"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
              <h2 className="text-sm font-black uppercase text-slate-500">Меню</h2>
              <Star size={16} className="text-mango" fill="currentColor" />
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={({ active, over }) => {
                if (!over || active.id === over.id) return;
                const oldIndex = categoryOrder.indexOf(active.id);
                const newIndex = categoryOrder.indexOf(over.id);
                saveCategoryOrder(arrayMove(categoryOrder, oldIndex, newIndex));
              }}
            >
              <SortableContext items={categoryOrder} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {categoryOrder.map((category) => (
                    <SortableCategory
                      key={category}
                      category={category}
                      activeCategory={activeCategory}
                      count={counts[category] || 0}
                      onSelect={setActiveCategory}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </aside>

        <section className="space-y-4">
          {notice && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-900">
              {notice}
              <button onClick={() => setNotice('')} className="grid h-7 w-7 place-items-center rounded-md hover:bg-teal-100">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Панель с поиском */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Поиск по названию, адресу или описанию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 outline-none focus:border-reef focus:ring-2 focus:ring-teal-100"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveCategory('Избранное')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 shrink-0"
            >
              <Heart size={16} />
              Избранное
            </button>
          </div>

          <div>
            <p className="text-sm font-bold text-hibiscus">{activeCategory}</p>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-950">
                {visiblePlaces.length ? `${visiblePlaces.length} мест` : 'Пока нет мест'}
              </h2>
              {searchQuery && visiblePlaces.length === 0 && (
                <p className="text-sm text-slate-500">Ничего не найдено</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visiblePlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                favorite={favorites.includes(place.id)}
                onFavorite={toggleFavorite}
                onShowMap={openPlaceOnMap}
                onEdit={editPlace}
                onDelete={deletePlace}
              />
            ))}
          </div>

          <section id="global-map" className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
              <div>
                <h2 className="text-lg font-black text-slate-950">Глобальная карта</h2>
                <p className="text-sm text-slate-500">
                  {isAdmin 
                    ? 'Нажмите на карту, чтобы добавить координаты. Перетащите маркер, чтобы изменить положение места.' 
                    : 'Нажмите на карту, чтобы добавить координаты места.'}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{places.filter(p => p.lat && p.lng).length} меток</span>
            </div>
            <div className="h-[520px]">
              <MapContainer center={SANYA_CENTER} zoom={13} scrollWheelZoom>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onPick={beginMapAdd} />
                <MapFocus place={selectedPlace} />
                {places.filter(p => p.lat && p.lng).map((place) => (
                  isAdmin && place.lat && place.lng ? (
                    <DraggableMarker
                      key={place.id}
                      place={place}
                      onPositionChange={updatePlaceCoordinates}
                    />
                  ) : (
                    <Marker key={place.id} position={[place.lat, place.lng]}>
                      <Popup>
                        <strong>{place.name}</strong>
                        <br />
                        {place.chinese_name}
                        <br />
                        {place.category}
                        {place.chinese_address && <><br />{place.chinese_address}</>}
                      </Popup>
                    </Marker>
                  )
                ))}
                {selectedPlace && selectedPlace.lat && selectedPlace.lng && (
                  <Marker position={[selectedPlace.lat, selectedPlace.lng]}>
                    <Popup>
                      <strong>{selectedPlace.name}</strong>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          </section>
        </section>
      </main>

      {showForm && (
        <AddPlaceForm
          draft={draft}
          categories={categoryOrder}
          onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
          onSubmit={isEditing ? updatePlace : addPlace}
          onClose={handleCloseForm}
          isEditing={isEditing}
        />
      )}
    </div>
  );
}

function emptyDraft() {
  return {
    name: '',
    chinese_name: '',
    chinese_address: '',
    category: 'Рестораны и кафе',
    photo_url: '',
    description: '',
    lat: '',
    lng: '',
    amap_url: '',
    trip_url: '',
  };
}

export default function App() {
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

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-reef">
        <RefreshCw className="animate-spin" size={28} />
      </div>
    );
  }

  if (!session) return <AuthPanel onSession={setSession} />;
  return <GuideApp session={session} onSignOut={signOut} />;
}
