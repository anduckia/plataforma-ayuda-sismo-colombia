/**
 * @type {import('next').NextConfig}
 */

// De dónde tira la cara pública, y de ningún otro sitio (RF-20).
const API = process.env.NEXT_PUBLIC_USHAHIDI_API ?? 'https://sos-sismo-colombia.api.ushahidi.io';
const TESELAS = 'https://*.tile.openstreetmap.fr';
const NOMINATIM = 'https://nominatim.openstreetmap.org';

/*
 * OJO con `unsafe-inline` en script-src: Next inyecta en cada página los
 * scripts en línea de la hidratación, y quitarlos exige nonces por petición
 * (middleware). Se deja, y por eso la CSP NO es la defensa contra XSS aquí: la
 * defensa es que React escapa todo y que el único HTML construido a mano —los
 * popups del mapa— pasa por `escapar()` en MapaSolicitudes.tsx.
 *
 * Lo que sí aporta esta CSP, y no es poco:
 *   - `connect-src`: aunque alguien lograra ejecutar un script, no podría
 *     mandarse a su propio servidor lo que la persona está escribiendo en el
 *     formulario —dirección exacta y teléfono incluidos— antes de enviarlo.
 *   - `frame-ancestors`: nadie puede empotrar el sitio en otra página para
 *     montar un clon que pida dinero con nuestra cara.
 *   - `form-action`: el formulario no puede acabar enviando a otro dominio.
 */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${TESELAS} https://*.tile.openstreetmap.org`,
  `connect-src 'self' ${API} ${NOMINATIM} ${TESELAS}`,
  "font-src 'self' data:",
  'upgrade-insecure-requests',
].join('; ');

const CABECERAS = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  /*
   * P2: sin esto, cada tesela del mapa y cada búsqueda de lugar le cuentan a
   * OpenStreetMap que esta persona está en /pido-ayuda. La URL de referencia
   * no debería salir del sitio.
   */
  { key: 'Referrer-Policy', value: 'same-origin' },
  /*
   * La ubicación se pide en el selector del mapa y solo ahí; lo demás, cerrado.
   * `geolocation=(self)` mantiene vivo el botón «Usar mi ubicación actual».
   */
  {
    key: 'Permissions-Policy',
    value: 'geolocation=(self), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()',
  },
];

const nextConfig = {
  reactStrictMode: true,
  // La cara pública no sube imágenes ni usa el optimizador: menos peso, menos
  // dependencias y menos que pueda fallar con mala señal.
  images: { unoptimized: true },
  // Ni versión ni pistas de qué corre detrás.
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:ruta*', headers: CABECERAS },
      // RF-19: /mapa lleva datos de personas reales (nombres, ubicaciones) y
      // no debe indexarse aunque un rastreador ignore robots.txt. El resto
      // del sitio sí se abre a buscadores (ver app/robots.ts).
      { source: '/mapa', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
};

export default nextConfig;
