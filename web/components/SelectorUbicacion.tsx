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
 * capas comerciales.
 */
const TESELAS = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
const CREDITO =
  '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>, ' +
  '<a href="https://hot.openstreetmap.org/">Humanitarian OSM</a>';

/*
 * Nominatim es el buscador de lugares de OpenStreetMap: gratuito y sin clave.
 * Su política pide no more de una consulta por segundo, así que solo se
 * consulta al pulsar «Buscar», nunca mientras se escribe.
 */
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

interface Lugar { nombre: string; lat: number; lon: number }

const enRango = (lat: number, lon: number) =>
  Number.isFinite(lat) && Number.isFinite(lon) &&
  lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;

export default function SelectorUbicacion({
  valor,
  alCambiar,
}: {
  valor: Punto | null;
  alCambiar: (p: Punto) => void;
}) {
  const contenedor = useRef<HTMLDivElement>(null);
  const apiMapa = useRef<{ mapa: any; poner: (lat: number, lon: number, zoom?: number) => void } | null>(null);
  const alCambiarRef = useRef(alCambiar);

  const [consulta, setConsulta] = useState('');
  const [lugares, setLugares] = useState<Lugar[] | null>(null);
  const [buscandoLugar, setBuscandoLugar] = useState(false);
  const [ubicando, setUbicando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  // Cajas de coordenadas: texto libre para poder escribir «-76.» sin pelear.
  const [latTexto, setLatTexto] = useState(valor ? String(valor.lat) : '');
  const [lonTexto, setLonTexto] = useState(valor ? String(valor.lon) : '');

  useEffect(() => { alCambiarRef.current = alCambiar; }, [alCambiar]);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelado || !contenedor.current || apiMapa.current) return;

      const mapa = L.map(contenedor.current, { scrollWheelZoom: false }).setView(CENTRO, ZOOM);
      L.tileLayer(TESELAS, { attribution: CREDITO, maxZoom: 18 }).addTo(mapa);

      const icono = L.divIcon({
        className: '',
        html: '<div style="width:22px;height:22px;border-radius:50%;background:#C1121F;' +
              'border:3px solid #fff;box-shadow:0 0 0 2px #141210"></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      let marca: any = null;
      const poner = (lat: number, lon: number, zoom?: number) => {
        const redondo = { lat: Number(lat.toFixed(6)), lon: Number(lon.toFixed(6)) };
        if (marca) marca.setLatLng([redondo.lat, redondo.lon]);
        else marca = L.marker([redondo.lat, redondo.lon], { icon: icono }).addTo(mapa);
        if (zoom) mapa.setView([redondo.lat, redondo.lon], zoom);
        setLatTexto(String(redondo.lat));
        setLonTexto(String(redondo.lon));
        alCambiarRef.current(redondo);
      };

      mapa.on('click', (e: any) => { setAviso(null); poner(e.latlng.lat, e.latlng.lng); });
      apiMapa.current = { mapa, poner };
      if (valor) poner(valor.lat, valor.lon, 13);
    })();

    return () => {
      cancelado = true;
      apiMapa.current?.mapa?.remove();
      apiMapa.current = null;
    };
    // Se monta una vez: `valor` solo siembra la posición inicial.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function buscarLugar(e: React.FormEvent) {
    e.preventDefault();
    const q = consulta.trim();
    if (!q) return;
    setBuscandoLugar(true);
    setAviso(null);
    setLugares(null);
    try {
      const url = `${NOMINATIM}?format=jsonv2&limit=5&countrycodes=co&accept-language=es` +
                  `&q=${encodeURIComponent(q)}`;
      const r = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error();
      const datos = await r.json();
      const encontrados: Lugar[] = (datos ?? []).map((d: any) => ({
        nombre: d.display_name,
        lat: Number(d.lat),
        lon: Number(d.lon),
      }));
      setLugares(encontrados);
      if (encontrados.length === 0) {
        setAviso('No encontramos ese lugar. Prueba con el municipio, o marca el punto en el mapa.');
      }
    } catch {
      setAviso('El buscador de lugares no responde. Marca el punto en el mapa o escribe las coordenadas.');
    } finally {
      setBuscandoLugar(false);
    }
  }

  const elegirLugar = (l: Lugar) => {
    apiMapa.current?.poner(l.lat, l.lon, 14);
    setLugares(null);
    setConsulta(l.nombre.split(',')[0]);
  };

  const usarMiUbicacion = () => {
    if (!navigator.geolocation) {
      setAviso('Este teléfono no permite compartir la ubicación. Marca el punto en el mapa.');
      return;
    }
    setUbicando(true);
    setAviso(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicando(false);
        apiMapa.current?.poner(pos.coords.latitude, pos.coords.longitude, 15);
      },
      () => {
        setUbicando(false);
        setAviso('No pudimos obtener tu ubicación. Marca el punto en el mapa o escribe las coordenadas.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const irACoordenadas = () => {
    const lat = Number(latTexto.replace(',', '.'));
    const lon = Number(lonTexto.replace(',', '.'));
    if (!enRango(lat, lon)) {
      setAviso('Esas coordenadas no son válidas. La latitud va de -90 a 90 y la longitud de -180 a 180.');
      return;
    }
    setAviso(null);
    apiMapa.current?.poner(lat, lon, 14);
  };

  return (
    <div>
      {/* Buscar por nombre: lo más natural para quien no maneja coordenadas. */}
      <div className="buscador">
        <input
          type="text"
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); buscarLugar(e); } }}
          placeholder="Barrio, vereda o municipio"
          aria-label="Buscar un lugar por su nombre"
        />
        <button type="button" className="boton boton--secundario boton--angosto"
                onClick={buscarLugar} disabled={buscandoLugar}>
          {buscandoLugar ? 'Buscando…' : 'Buscar'}
        </button>
      </div>

      {lugares && lugares.length > 0 && (
        <ul className="resultados">
          {lugares.map((l, i) => (
            <li key={i}>
              <button type="button" onClick={() => elegirLugar(l)}>{l.nombre}</button>
            </li>
          ))}
        </ul>
      )}

      <div ref={contenedor} className="mapa mapa--selector" role="application"
           aria-label="Mapa para marcar la ubicación" />

      <p className="coordenadas">
        {valor
          ? `Punto marcado en ${valor.lat}, ${valor.lon}`
          : 'Toca el mapa para marcar el punto, o búscalo por nombre.'}
      </p>

      <button type="button" className="boton boton--secundario" onClick={usarMiUbicacion}
              disabled={ubicando}>
        {ubicando ? 'Buscando tu ubicación…' : 'Usar mi ubicación actual'}
      </button>

      {/* Coordenadas a mano: para quien las recibe por radio o GPS. */}
      <div className="coordenadas-manuales">
        <div>
          <label htmlFor="lat-manual">Latitud</label>
          <input id="lat-manual" type="text" inputMode="decimal" value={latTexto}
                 onChange={(e) => setLatTexto(e.target.value)} placeholder="5.6947" />
        </div>
        <div>
          <label htmlFor="lon-manual">Longitud</label>
          <input id="lon-manual" type="text" inputMode="decimal" value={lonTexto}
                 onChange={(e) => setLonTexto(e.target.value)} placeholder="-76.6611" />
        </div>
        <button type="button" className="boton boton--secundario boton--angosto"
                onClick={irACoordenadas}>
          Marcar
        </button>
      </div>

      {aviso && <p className="campo__ayuda" role="status">{aviso}</p>}
    </div>
  );
}
