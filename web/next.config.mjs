/**
 * @type {import('next').NextConfig}
 */

/*
 * El directorio no habla con nadie: no hay API, ni teselas de mapa, ni
 * geocodificador, ni un solo componente de cliente. Todo lo que pinta sale del
 * propio origen, así que la CSP puede cerrarse a `'self'` y punto.
 *
 * Los enlaces a fuentes externas no necesitan permiso aquí: navegar a otro
 * sitio no es cargar un recurso, y ninguna de estas directivas lo limita.
 *
 * OJO con `unsafe-inline` en script-src: Next inyecta en cada página los
 * scripts en línea de la hidratación, y quitarlos exige nonces por petición
 * (middleware). Se deja, y por eso la CSP NO es la defensa contra XSS aquí: la
 * defensa es que React escapa todo y que ya no queda HTML construido a mano en
 * ninguna parte —los popups del mapa eran el único sitio donde lo había—.
 *
 * Lo que sí aporta, y no es poco:
 *   - `connect-src 'self'`: aunque alguien lograra ejecutar un script, no
 *     podría mandarse nada a su propio servidor.
 *   - `frame-ancestors 'none'`: nadie puede empotrar el sitio en otra página
 *     para montar un clon que pida dinero con nuestra cara. En un directorio
 *     de emergencia esto importa más que antes: la credibilidad prestada es
 *     justo lo que busca una estafa post-desastre.
 */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "font-src 'self'",
  'upgrade-insecure-requests',
].join('; ');

const CABECERAS = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  /*
   * Los enlaces salen a sitios de terceros. Sin esto, cada alcaldía y cada red
   * social a la que mandamos gente recibiría de qué sección del directorio
   * vino —o sea, qué estaba buscando esa persona—. No es asunto suyo.
   *
   * No afecta a la indexación: el rastreador entra por la URL, no por un
   * enlace, y no mira esta cabecera.
   */
  { key: 'Referrer-Policy', value: 'same-origin' },
  // No queda nada que pida permisos del dispositivo: se cierran todos.
  {
    key: 'Permissions-Policy',
    value: 'geolocation=(), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()',
  },
  /*
   * T-067 · Aquí vivía `X-Robots-Tag: noindex, nofollow`. Retirado el
   * 14-ago-2026 junto con la regla de `robots.ts` y el `robots` del layout: los
   * tres iban juntos y se levantaron los tres, con la condición previa de RF-38
   * confirmada (ya no queda dato personal servido por la cara pública).
   *
   * Que no vuelva a colarse por descuido: una cabecera `noindex` servida en
   * todas las rutas gana a cualquier metadata que diga lo contrario, y el
   * síntoma —no aparecer en Google— tarda semanas en notarse.
   */
];

const nextConfig = {
  reactStrictMode: true,
  // El directorio no sube ni sirve imágenes: menos peso y menos que falle.
  images: { unoptimized: true },
  // Ni versión ni pistas de qué corre detrás.
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:ruta*', headers: CABECERAS }];
  },
};

export default nextConfig;
