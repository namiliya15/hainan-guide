import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const SANYA_CENTER = [18.2218, 109.515];

const pickerIcon = L.divIcon({
  className: '',
  html: '<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:#FF7A59;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(11,36,34,0.35);border:2px solid white"></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

function ClickToPick({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Простая встроенная карта: клик ставит/переставляет метку, маркер можно
// дотащить точнее. Используется вместо ручного ввода широты/долготы —
// куда проще для админа "ткнуть в карту", чем печатать десятичные числа.
export function LocationPicker({ lat, lng, onChange }) {
  const hasPosition = lat !== null && lat !== undefined && lat !== '' && lng !== null && lng !== undefined && lng !== '';
  const position = hasPosition ? [Number(lat), Number(lng)] : null;

  return (
    <div className="overflow-hidden rounded-lg border border-sand-300 dark:border-night-surface2">
      <div className="h-56">
        <MapContainer center={position || SANYA_CENTER} zoom={position ? 15 : 11} scrollWheelZoom={false} style={{ height: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.amap.com/" target="_blank" rel="noreferrer">高德地图 AutoNavi</a>'
            url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
            subdomains="1234"
          />
          <ClickToPick onPick={onChange} />
          {position && (
            <Marker
              position={position}
              icon={pickerIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat: newLat, lng: newLng } = e.target.getLatLng();
                  onChange(newLat, newLng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>
      <p className="border-t border-sand-300 bg-sand-200/60 px-3 py-1.5 text-xs text-slate-500 dark:border-night-surface2 dark:bg-night-surface2/60 dark:text-mist">
        {position ? `Метка: ${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)} — можно перетащить точнее` : 'Кликните на карту, чтобы отметить место'}
      </p>
    </div>
  );
}
