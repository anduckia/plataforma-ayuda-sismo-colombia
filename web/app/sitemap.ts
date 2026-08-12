import type { MetadataRoute } from 'next';
import { FORMULARIOS } from '@/lib/ushahidi';

const BASE = 'https://www.sossismocolombia.com.co';

// Espejo de app/robots.ts: solo las rutas que sí se abren a indexación
// (ADR-023). /mapa no entra aquí a propósito.
export default function sitemap(): MetadataRoute.Sitemap {
  const rutas = ['', 'enlaces-oficiales', 'privacidad', ...Object.keys(FORMULARIOS)];
  return rutas.map((ruta) => ({
    url: ruta ? `${BASE}/${ruta}` : `${BASE}/`,
    changeFrequency: ruta ? 'monthly' : 'daily',
  }));
}
