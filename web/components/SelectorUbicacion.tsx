'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

export interface Punto { lat: number; lon: number }

/** Centro y zoom que abarcan Chocó, Valle, Risaralda, Quindío y Caldas. */
const CENTRO: [number, number] = [5.0, -76.2];
const ZOOM = 7;

/*
 * Teselas Humanitarian OpenStreetMap: no necesitan clave de ninguna clase y
 * están hechas para respuesta a desastres, con mejor detalle rural que las
 * capas comerciales. Las capas de Mapbox del cliente de Ushahidi dependen de
 * una cuenta compartida que hoy devuelve 403.
 */
const TESELAS = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
const CREDITO =
  '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>, ' +
  '<a href="https://hot.openstreetmap.org/">Humanitarian OSM</a>';

export default function SelectorUbicacion({
  valor,
  alCambiar,
}: {
  valor: Punto | null;
  alCambiar: (p: Punto) => void;
}) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<any>(null);
  const marcaRef = useRef<any>(null);
  const alCambiarRef = useRef(alCambiar);
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  // El callback cambia en cada render del padre; el mapa se monta una sola vez.
  useEffect(() => { alCambiarRef.current = alCambiar; }, [alCambiar]);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelado || !contenedor.current || mapaRef.current) return;

      const mapa = L.map(contenedor.current, { scrollWheelZoom: false }).setView(CENTRO, ZOOM);
      L.tileLayer(TESELAS, { attribution: CREDITO, maxZoom: 18 }).addTo(mapa);

      const icono = L.divIcon({
        className: '',
        html: '<div style="width:22px;height:22px;border-radius:50%;background:#C1121F;' +
              'border:3px solid #fff;box-shadow:0 0 0 2px #141210"></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const poner = (lat: number, lon: number) => {
        if (marcaRef.current) marcaRef.current.setLatLng([lat, lon]);
        else marcaRef.current = L.marker([lat, lon], { icon: icono }).addTo(mapa);
        alCambiarRef.current({ lat, lon });
      };

      mapa.on('click', (e: any) => poner(e.latlng.lat, e.latlng.lng));
      if (valor) { poner(valor.lat, valor.lon); mapa.setView([valor.lat, valor.lon], 13); }
      mapaRef.current = { mapa, poner };
    })();

    return () => {
      cancelado = true;
      mapaRef.current?.mapa?.remove();
      mapaRef.current = null;
    };
    // Se monta una vez a propósito: `valor` solo siembra la posición inicial.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usarMiUbicacion = () => {
    if (!navigator.geolocation) {
      setAviso('Este teléfono no permite compartir la ubicación. Marca el punto en el mapa.');
      return;
    }
    setBuscando(true);
    setAviso(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBuscando(false);
        const { latitude, longitude } = pos.coords;
        mapaRef.current?.poner(latitude, longitude);
        mapaRef.current?.mapa.setView([latitude, longitude], 15);
      },
      () => {
        setBuscando(false);
        setAviso('No pudimos obtener tu ubicación. Marca el punto en el mapa tocándolo.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div>
      <div ref={contenedor} className="mapa mapa--selector" role="application"
           aria-label="Mapa para marcar la ubicación" />
      <p className="coordenadas">
        {valor
          ? `Punto marcado en ${valor.lat.toFixed(4)}, ${valor.lon.toFixed(4)}`
          : 'Toca el mapa para marcar tu barrio o vereda.'}
      </p>
      <button type="button" className="boton boton--secundario" onClick={usarMiUbicacion}
              disabled={buscando}>
        {buscando ? 'Buscando tu ubicación…' : 'Usar mi ubicación actual'}
      </button>
      {aviso && <p className="campo__ayuda" role="status">{aviso}</p>}
    </div>
  );
}
