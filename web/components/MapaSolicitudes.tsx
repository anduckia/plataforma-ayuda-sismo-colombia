'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import type { Solicitud } from '@/lib/ushahidi';

const CENTRO: [number, number] = [5.0, -76.2];
const ZOOM = 7;
const TESELAS = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
const CREDITO =
  '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>, ' +
  '<a href="https://hot.openstreetmap.org/">Humanitarian OSM</a>';

/** El color del punto es la urgencia: es lo único que hay que leer de un vistazo. */
function color(urgencia: string | null): string {
  if (!urgencia) return '#4A453E';
  if (urgencia.includes('CRÍTICA')) return '#C1121F';
  if (urgencia.includes('ALTA')) return '#D9541A';
  if (urgencia.includes('MEDIA')) return '#B8860B';
  return '#4A453E';
}

const escapar = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export default function MapaSolicitudes({ solicitudes }: { solicitudes: Solicitud[] }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<any>(null);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelado || !contenedor.current || mapaRef.current) return;

      const mapa = L.map(contenedor.current).setView(CENTRO, ZOOM);
      L.tileLayer(TESELAS, { attribution: CREDITO, maxZoom: 18 }).addTo(mapa);
      mapaRef.current = mapa;

      const conPunto = solicitudes.filter((s) => s.punto);
      for (const s of conPunto) {
        const c = color(s.urgencia);
        L.marker([s.punto!.lat, s.punto!.lon], {
          icon: L.divIcon({
            className: '',
            html: `<div style="width:20px;height:20px;border-radius:50%;background:${c};` +
                  `border:3px solid #fff;box-shadow:0 0 0 2px #141210"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }),
          title: s.title,
        })
          .addTo(mapa)
          .bindPopup(
            `<strong>${escapar(s.title)}</strong>` +
            (s.urgencia ? `<br>${escapar(s.urgencia)}` : '') +
            (s.municipio ? `<br>${escapar(s.municipio)}` : '') +
            (s.estado ? `<br>Estado: ${escapar(s.estado)}` : ''),
          );
      }

      if (conPunto.length > 1) {
        mapa.fitBounds(
          L.latLngBounds(conPunto.map((s) => [s.punto!.lat, s.punto!.lon] as [number, number])),
          { padding: [30, 30], maxZoom: 12 },
        );
      }
    })();

    return () => {
      cancelado = true;
      mapaRef.current?.remove();
      mapaRef.current = null;
    };
  }, [solicitudes]);

  return <div ref={contenedor} className="mapa" role="application"
              aria-label="Mapa de solicitudes publicadas" />;
}
