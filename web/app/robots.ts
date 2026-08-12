import type { MetadataRoute } from 'next';

/**
 * Indexación selectiva (RF-19, P2, revisado).
 *
 * El mapa lleva nombres de personas desaparecidas —de menores incluidos—,
 * municipios y necesidades, publicados por gente en la peor semana de su vida
 * y sin más consentimiento que un formulario llenado a las prisas. Google no
 * olvida: una búsqueda por el nombre de una niña seguiría devolviendo «Busco a
 * un familiar» años después de que apareciera, y esa huella no la borra ni
 * retirar la publicación. Por eso /mapa se queda fuera.
 *
 * El resto de páginas (inicio, formularios vacíos, enlaces oficiales,
 * privacidad) no muestra ningún dato ya enviado por nadie, y sí le sirve a
 * quien busca «ayuda sismo Colombia» sin conocer todavía el enlace por
 * WhatsApp/radio/SMS. Se abren a indexación.
 *
 * OJO: esto es una petición, no un control de acceso. Un rastreador que la
 * ignore entra igual; lo que impide de verdad ver los datos protegidos es la
 * privacidad campo a campo (ADR-006), no este archivo.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/mapa' }],
    sitemap: 'https://www.sossismocolombia.com.co/sitemap.xml',
  };
}
