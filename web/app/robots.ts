import type { MetadataRoute } from 'next';

/**
 * Fuera de los buscadores (RF-19, P2).
 *
 * El mapa lleva nombres de personas desaparecidas —de menores incluidos—,
 * municipios y necesidades, publicados por gente en la peor semana de su vida
 * y sin más consentimiento que un formulario llenado a las prisas. Google no
 * olvida: una búsqueda por el nombre de una niña seguiría devolviendo «Busco a
 * un familiar» años después de que apareciera, y esa huella no la borra ni
 * retirar la publicación.
 *
 * La plataforma se difunde por WhatsApp, radio y SMS —los canales que de verdad
 * llegan a la zona—, y ninguno depende de estar indexado.
 *
 * OJO: esto es una petición, no un control de acceso. Un rastreador que la
 * ignore entra igual; lo que impide de verdad ver los datos protegidos es la
 * privacidad campo a campo (ADR-006), no este archivo.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', disallow: '/' }],
  };
}
