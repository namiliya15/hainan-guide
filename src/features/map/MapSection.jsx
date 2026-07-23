import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed } from 'lucide-react';
import { useGeolocation } from './useGeolocation';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = L.divIcon({
  className: '',
  html: '<div style="width:16px;height:16px;border-radius:999px;background:#1FADA2;border:3px solid white;box-shadow:0 0 0 4px rgba(31,173,162,0.35)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const SANYA_CENTER = [18.2218, 109.515];

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

function DraggableMarker({ place, onPositionChange, onSingleTap, onDoubleTap }) {
  const [position, setPosition] = useState([place.lat, place.lng]);
  const eventHandlers = {
    dragend(event) {
      const marker = event.target;
      const newLat = marker.getLatLng().lat;
      const newLng = marker.getLatLng().lng;
      setPosition([newLat, newLng]);
      onPositionChange(place.id, newLat, newLng);
    },
    click: () => onSingleTap?.(place),
    dblclick: () => onDoubleTap?.(place),
  };
  return (
    <Marker position={position} draggable eventHandlers={eventHandlers}>
      <Popup>{place.name}</Popup>
    </Marker>
  );
}

function PlaceMarker({ place, onSingleTap, onDoubleTap }) {
  const eventHandlers = {
    click: () => onSingleTap?.(place),
    dblclick: () => onDoubleTap?.(place),
  };
  return (
    <Marker position={[place.lat, place.lng]} eventHandlers={eventHandlers}>
      {/* Одиночный тап — всплывает только название (см. требование).
          Двойной тап — открывает полную карточку (PlaceModal) без скролла. */}
      <Popup>{place.name}</Popup>
    </Marker>
  );
}

export function MapSection({ id, places, selectedPlace, isAdmin, onMapClick, onPositionChange, onOpenPlace }) {
  const pinned = places.filter((p) => p.lat && p.lng);
  const { position: userPosition, error: geoError, locating, locate } = useGeolocation();

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
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {isAdmin && <MapClickHandler onPick={onMapClick} />}
          <MapFocus place={selectedPlace} userPosition={userPosition} />
          {pinned.map((place) =>
            isAdmin ? (
              <DraggableMarker
                key={place.id}
                place={place}
                onPositionChange={onPositionChange}
                onSingleTap={() => {}}
                onDoubleTap={onOpenPlace}
              />
            ) : (
              <PlaceMarker key={place.id} place={place} onSingleTap={() => {}} onDoubleTap={onOpenPlace} />
            )
          )}
          {selectedPlace?.lat && selectedPlace?.lng && (
            <Marker position={[selectedPlace.lat, selectedPlace.lng]}>
              <Popup>{selectedPlace.name}</Popup>
            </Marker>
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
