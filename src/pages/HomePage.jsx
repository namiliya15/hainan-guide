import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, Heart, MapPinPlus, Search, X } from 'lucide-react';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { usePlaces, emptyDraft } from '../features/places/usePlaces';
import { useFavorites } from '../features/favorites/useFavorites';
import { useCategoryOrder } from '../features/categories/useCategoryOrder';
import { useFeedback } from '../features/feedback/useFeedback';
import { CategoryMenu } from '../features/categories/CategoryMenu';
import { PlaceCard } from '../features/places/PlaceCard';
import { PlaceModal } from '../features/places/PlaceModal';
import { AddPlaceForm } from '../features/places/AddPlaceForm';
import { SuggestPlaceForm } from '../features/feedback/SuggestPlaceForm';
import { ReportIssueForm } from '../features/feedback/ReportIssueForm';
import { MapSection } from '../features/map/MapSection';

export function HomePage({ session, onRequireAuth, addPlaceSignal }) {
  const isAdmin = useIsAdmin(session);
  const { places, notice, clearNotice, searchAll, addPlace, updatePlace, deletePlace, updatePlaceCoordinates, deleteImageFromPlace, uploadPlaceImage } =
    usePlaces(session);
  const { favorites, toggleFavorite } = useFavorites(session, onRequireAuth);
  const { categoryOrder, saveCategoryOrder } = useCategoryOrder(session);
  const { submitSuggestion, submitReport, notice: feedbackNotice } = useFeedback(session, isAdmin);

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'Пляжи');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [modalPlace, setModalPlace] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlaceId, setEditingPlaceId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft());
  const [reportPlace, setReportPlace] = useState(null);
  const [showSuggestForm, setShowSuggestForm] = useState(false);

  // Ссылки на категории из мобильного меню ведут на "/?category=Пляжи" —
  // подхватываем это здесь и сразу чистим URL, чтобы дальнейшие клики по
  // "пилюлям" на странице работали как обычно, без лишнего query-параметра.
  useEffect(() => {
    const fromUrl = searchParams.get('category');
    if (fromUrl) {
      setActiveCategory(fromUrl);
      searchParams.delete('category');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Поиск — уже сейчас ищет по ВСЕМ местам сразу, а не только внутри
  // выбранной категории (см. комментарий в usePlaces.searchAll).
  const searchResults = useMemo(() => searchAll(searchQuery), [searchAll, searchQuery]);

  const visiblePlaces = useMemo(() => {
    if (searchQuery.trim()) return searchResults || [];
    if (activeCategory === 'Избранное') return places.filter((p) => favorites.includes(p.id));
    return places.filter((p) => p.category === activeCategory);
  }, [activeCategory, favorites, places, searchResults, searchQuery]);

  const counts = useMemo(
    () =>
      categoryOrder.reduce((acc, category) => {
        acc[category] = category === 'Избранное' ? favorites.length : places.filter((p) => p.category === category).length;
        return acc;
      }, {}),
    [categoryOrder, favorites, places]
  );

  function openAddForm(latlng) {
    setDraft(latlng ? { ...emptyDraft(), lat: latlng.lat.toFixed(6), lng: latlng.lng.toFixed(6) } : emptyDraft());
    setIsEditing(false);
    setEditingPlaceId(null);
    setShowForm(true);
  }

  // Кнопка "Добавить место" живёт в шапке (App/Navbar), а сама форма и её
  // состояние — здесь, на странице. Шапка шлёт сигнал (счётчик), а страница
  // открывает форму в ответ.
  useEffect(() => {
    if (addPlaceSignal) openAddForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addPlaceSignal]);

  function openEditForm(place) {
    setDraft({
      name: place.name || '',
      chinese_name: place.chinese_name || '',
      chinese_address: place.chinese_address || '',
      category: place.category || 'Рестораны и кафе',
      photos: place.photos || null,
      description: place.description || '',
      working_hours: place.working_hours || '',
      price_info: place.price_info || '',
      extra_info: place.extra_info || '',
      lat: place.lat?.toString() || '',
      lng: place.lng?.toString() || '',
      amap_url: place.amap_url || '',
      trip_url: place.trip_url || '',
    });
    setIsEditing(true);
    setEditingPlaceId(place.id);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setIsEditing(false);
    setEditingPlaceId(null);
    setDraft(emptyDraft());
  }

  async function submitForm(event) {
    event.preventDefault();
    if (isEditing) await updatePlace(editingPlaceId, draft);
    else {
      await addPlace(draft, session?.user?.id);
      setActiveCategory(draft.category);
    }
    closeForm();
  }

  function showOnMap(place) {
    setSelectedPlace(place);
    document.getElementById('global-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div>
      {/* ---------- HERO ---------- */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#0B4C48] via-lagoon to-aqua pb-32 pt-16 text-white dark:from-[#041815] dark:via-[#0A2E29] dark:to-[#135C54] sm:pb-40 sm:pt-24">
        <svg className="pointer-events-none absolute -bottom-8 -left-10 w-72 text-white/10" viewBox="0 0 200 220" fill="none">
          <path d="M100 220V90" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <path d="M100 90C100 90 40 70 20 30" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <path d="M100 90C100 90 160 60 190 40" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <path d="M100 90C100 90 60 50 60 5" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        </svg>

        <div className="relative z-10 mx-auto flex max-w-6xl justify-end px-4 sm:px-6">
          <div className="max-w-md text-right">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-teal-100">
              <Compass size={14} />
              18.25° с.ш. · Южно-Китайское море
            </div>
            <h1 className="font-display text-4xl font-medium leading-tight sm:text-5xl">Путеводитель по о. Хайнань</h1>
            <p className="mt-2 flex items-center justify-end gap-2 text-lg text-teal-50">
              город Санья
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22V10M12 10C12 10 4 8 2 3M12 10C12 10 20 7 22 4M12 10C12 10 8 5 8 1M12 10C12 10 15 4 14 0" strokeLinecap="round" />
              </svg>
            </p>
          </div>
        </div>

        {/* линия берега — разделитель между hero и контентом */}
        <div className="absolute inset-x-0 bottom-0 z-10 leading-none">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="h-20 w-full sm:h-24">
            <path d="M0,40 C 240,90 480,0 720,30 C 960,60 1200,10 1440,45 L1440,100 L0,100 Z" className="fill-sand dark:fill-night" />
          </svg>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* ---------- ПОИСК (плавающий) ---------- */}
        <div className="relative z-20 -mt-14 sm:-mt-16">
          <div className="flex gap-2 rounded-2xl border border-sand-300 bg-white p-2 shadow-lg dark:border-night-surface2 dark:bg-night-surface">
            <div className="flex flex-1 items-center gap-2.5 px-3">
              <Search className="shrink-0 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пляж, ресторан, отель — ищите по всему острову..."
                className="w-full bg-transparent py-2.5 text-[15px] text-ink outline-none placeholder:text-slate-400 dark:text-white"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setActiveCategory('Избранное')}
              className="hidden shrink-0 items-center gap-2 rounded-xl border border-sand-300 px-4 text-sm font-bold text-slate-700 hover:bg-sand-200 sm:inline-flex dark:border-night-surface2 dark:text-mist dark:hover:bg-night-surface2"
            >
              <Heart size={16} />
              Избранное
            </button>
          </div>
        </div>

        {notice && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-lagoon/30 bg-lagoon/10 px-4 py-3 text-sm font-semibold text-lagoon-600 dark:text-aqua">
            {notice}
            <button onClick={clearNotice} className="grid h-7 w-7 place-items-center rounded-md hover:bg-lagoon/10">
              <X size={16} />
            </button>
          </div>
        )}
        {feedbackNotice && (
          <div className="mt-4 rounded-lg border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-semibold text-coral-600 dark:text-coral">
            {feedbackNotice}
          </div>
        )}

        {/* ---------- КАТЕГОРИИ ---------- */}
        <CategoryMenu
          categoryOrder={categoryOrder}
          activeCategory={activeCategory}
          counts={counts}
          onSelect={setActiveCategory}
          onReorder={saveCategoryOrder}
        />

        {/* ---------- СПИСОК МЕСТ ---------- */}
        <div className="mb-4 mt-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-medium text-ink dark:text-white">
            {visiblePlaces.length ? `${visiblePlaces.length} мест` : 'Пока нет мест'}
          </h2>
          <span className="text-sm text-slate-500 dark:text-mist">
            {searchQuery ? `Поиск: «${searchQuery}»` : activeCategory}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 xl:grid-cols-3">
          {visiblePlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              favorite={favorites.includes(place.id)}
              isAdmin={isAdmin}
              onFavorite={toggleFavorite}
              onShowMap={showOnMap}
              onEdit={openEditForm}
              onDelete={deletePlace}
              onDeleteImage={deleteImageFromPlace}
              onReportIssue={setReportPlace}
            />
          ))}
        </div>

        {/* ---------- КАРТА ---------- */}
        <div className="pb-8 pt-4">
          <MapSection
            id="global-map"
            places={places}
            selectedPlace={selectedPlace}
            isAdmin={isAdmin}
            onMapClick={openAddForm}
            onPositionChange={updatePlaceCoordinates}
            onOpenPlace={setModalPlace}
          />
        </div>

        <div className="flex justify-center pb-16">
          <button
            type="button"
            onClick={() => setShowSuggestForm(true)}
            className="inline-flex items-center gap-2 rounded-full border border-sand-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-sand-200 dark:border-night-surface2 dark:bg-night-surface dark:text-mist dark:hover:bg-night-surface2"
          >
            <MapPinPlus size={16} />
            Знаете интересное место? Предложите его
          </button>
        </div>
      </div>

      {modalPlace && (
        <PlaceModal
          place={modalPlace}
          favorite={favorites.includes(modalPlace.id)}
          isAdmin={isAdmin}
          onClose={() => setModalPlace(null)}
          onFavorite={toggleFavorite}
          onEdit={(place) => {
            setModalPlace(null);
            openEditForm(place);
          }}
          onDelete={(placeId) => {
            setModalPlace(null);
            deletePlace(placeId);
          }}
          onDeleteImage={deleteImageFromPlace}
          onReportIssue={setReportPlace}
        />
      )}

      <SuggestPlaceForm
        open={showSuggestForm}
        onClose={() => setShowSuggestForm(false)}
        onSubmit={submitSuggestion}
        needsEmail={!session}
      />

      <ReportIssueForm
        open={Boolean(reportPlace)}
        place={reportPlace}
        onClose={() => setReportPlace(null)}
        onSubmit={submitReport}
        needsEmail={!session}
      />

      {showForm && (
        <AddPlaceForm
          draft={draft}
          categories={categoryOrder}
          onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
          onSubmit={submitForm}
          onClose={closeForm}
          isEditing={isEditing}
          onUploadImages={uploadPlaceImage}
        />
      )}
    </div>
  );
}
