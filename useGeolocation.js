import { useState } from 'react';

export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);

  function locate() {
    if (!navigator.geolocation) {
      setError('Геолокация не поддерживается этим браузером');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => {
        setError('Не удалось определить местоположение — проверьте разрешения браузера');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return { position, error, locating, locate };
}
