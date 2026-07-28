import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed } from 'lucide-react';
import { useGeolocation } from './useGeolocation';

const SANYA_CENTER = [18.2218, 109.515];

// По умолчанию Leaflet добавляет в угол карты свою фирменную подпись со
// ссылкой на leaflet.com — в последних версиях библиотеки в неё вшит флаг
// Украины как часть их брендинга. Это никак не связано с самой картой или
// Amap, поэтому эту часть подписи убираем (prefix: false), а copyright
// самого источника карты (Amap) — оставляем, его стоит сохранять.
function BareAttribution() {
  const map = useMap();
  useEffect(() => {
    const control = L.control.attribution({ prefix: false, position: 'bottomright' }).addTo(map);
    return () => control.remove();
  }, [map]);
  return null;
}

// Метки-"капли" своего цвета вместо стандартной синей иконки Leaflet:
// обычная — цвет бренда (lagoon), активная (выбрана кликом по карточке
// "На карте" ИЛИ тапом по самой метке) — коралловая.
function pinIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);box-shadow:0 2px 6px rgba(11,36,34,0.35);border:2px solid white"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -28],
  });
}
const NORMAL_ICON = pinIcon('#0E6B64');
const ACTIVE_ICON = pinIcon('#FF7A59');

const userIcon = L.divIcon({
  className: '',
  html: '<div style="width:16px;height:16px;border-radius:999px;background:#1FADA2;border:3px solid white;box-shadow:0 0 0 4px rgba(31,173,162,0.35)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapClickHandler({ onPick }) {
  useMapEvents({
    click(event) {
      onPick?.(event.latlng);
    },
  });
  return null;
}

function MapFocus({ place, userPosition }) {
  const map = useMap();
  useEffect(() => {
    if (place?.lat && place?.lng) map.setView([place.lat, place.lng], 15, { animate: true });
  }, [map, place]);
  useEffect(() => {
    if (userPosition) map.setView(userPosition, 14, { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPosition]);
  return null;
}

function DraggableMarker({ place, isActive, onPositionChange, onSelect, onDoubleTap }) {
  const [position, setPosition] = useState([place.lat, place.lng]);
  const eventHandlers = {
    dragend(event) {
      const marker = event.target;
      const newLat = marker.getLatLng().lat;
      const newLng = marker.getLatLng().lng;
      setPosition([newLat, newLng]);
      onPositionChange(place.id, newLat, newLng);
    },
    click: () => onSelect?.(place.id),
    dblclick: () => onDoubleTap?.(place),
    popupclose: () => onSelect?.(null, place.id),
  };
  return (
    <Marker position={position} draggable icon={isActive ? ACTIVE_ICON : NORMAL_ICON} eventHandlers={eventHandlers}>
      <Popup>{place.name}</Popup>
    </Marker>
  );
}

function PlaceMarker({ place, isActive, onSelect, onDoubleTap }) {
  const eventHandlers = {
    click: () => onSelect?.(place.id),
    dblclick: () => onDoubleTap?.(place),
    // Когда попап закрывается (тап мимо, крестик, повторный тап по метке) —
    // метка возвращается в обычный цвет, если только её не выбрали заново.
    popupclose: () => onSelect?.(null, place.id),
  };
  return (
    <Marker position={[place.lat, place.lng]} icon={isActive ? ACTIVE_ICON : NORMAL_ICON} eventHandlers={eventHandlers}>
      {/* Одиночный тап — всплывает только название (см. требование).
          Двойной тап — открывает полную карточку (PlaceModal) без скролла. */}
      <Popup>{place.name}</Popup>
    </Marker>
  );
}

export function MapSection({ id, places, selectedPlace, isAdmin, onMapClick, onPositionChange, onOpenPlace }) {
  const pinned = places.filter((p) => p.lat && p.lng);
  const { position: userPosition, error: geoError, locating, locate } = useGeolocation();
  const [activeId, setActiveId] = useState(null);

  // Кнопка "На карте" на карточке места — та же метка на карте становится
  // активной (красной), а не рисуется вторым маркером поверх существующего.
  useEffect(() => {
    if (selectedPlace?.id) setActiveId(selectedPlace.id);
  }, [selectedPlace]);

  function handleSelect(id, closedId) {
    // closedId используется в обработчике popupclose: сбрасываем цвет, только
    // если закрылся попап именно у текущей активной метки (а не у другой).
    if (id === null) {
      setActiveId((current) => (current === closedId ? null : current));
    } else {
      setActiveId(id);
    }
  }

  return (
    <section id={id} className="overflow-hidden rounded-2xl border border-sand-300 bg-white shadow-sm dark:border-night-surface2 dark:bg-night-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand-300 px-5 py-4 dark:border-night-surface2">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink dark:text-white">Глобальная карта</h2>
          <p className="text-sm text-slate-500 dark:text-mist">
            {isAdmin
              ? 'Клик на карту — добавить точку. Тап по метке — название, двойной тап — карточка.'
              : 'Тап по метке — название, двойной тап — карточка места.'}
          </p>
          {geoError && <p className="text-xs text-coral">{geoError}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={locate}
            disabled={locating}
            className="inline-flex items-center gap-1.5 rounded-full border border-sand-300 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-sand-200 disabled:opacity-60 dark:border-night-surface2 dark:text-mist dark:hover:bg-night-surface2"
          >
            <LocateFixed size={14} />
            {locating ? 'Определяем...' : 'Моё местоположение'}
          </button>
          <span className="rounded-full bg-sand-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-night-surface2 dark:text-mist">
            {pinned.length} меток
          </span>
        </div>
      </div>
      <div className="h-[420px] sm:h-[500px]">
        <MapContainer
          center={selectedPlace?.lat && selectedPlace?.lng ? [selectedPlace.lat, selectedPlace.lng] : SANYA_CENTER}
          zoom={13}
          scrollWheelZoom
          attributionControl={false}
        >
          <BareAttribution />
          <TileLayer
            attribution='&copy; <a href="https://www.amap.com/" target="_blank" rel="noreferrer">高德地图 AutoNavi</a>'
            url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
            subdomains="1234"
          />
          {isAdmin && <MapClickHandler onPick={onMapClick} />}
          <MapFocus place={selectedPlace} userPosition={userPosition} />
          {pinned.map((place) =>
            isAdmin ? (
              <DraggableMarker
                key={place.id}
                place={place}
                isActive={activeId === place.id}
                onPositionChange={onPositionChange}
                onSelect={handleSelect}
                onDoubleTap={onOpenPlace}
              />
            ) : (
              <PlaceMarker key={place.id} place={place} isActive={activeId === place.id} onSelect={handleSelect} onDoubleTap={onOpenPlace} />
            )
          )}
          {userPosition && (
            <Marker position={userPosition} icon={userIcon}>
              <Popup>Вы здесь</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </section>
  );
}
