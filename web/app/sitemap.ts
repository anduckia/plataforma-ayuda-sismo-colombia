import type { MetadataRoute } from 'next';
import { SITIO } from '@/lib/sitio';
import { FUENTES } from '@/lib/fuentes-datos';
import { revisar } from '@/lib/fuentes';
import { hoyEnBogota } from '@/lib/fecha';

/**
 * Las dos páginas que queremos en el índice (RF-38).
 *
 * Deliberadamente NO están el mapa ni los cuatro formularios retirados: son
 * páginas delgadas que dicen todas lo mismo, y meterlas aquí sería pedirle a
 * Google que reparta entre seis URLs la relevancia que queremos concentrada en
 * una. Siguen vivas para quien llega con un enlace viejo; eso no las hace
 * candidatas a buscador.
 *
 * `lastModified` de la portada sale de la fuente revisada más recientemente, no
 * de la fecha de compilación. Es el único dato honesto: la página se
 * reconstruye cada media hora aunque no haya cambiado nada, y decir que se
 * modificó cuando no se tocó ninguna ficha es exactamente el ruido por el que
 * los buscadores acabaron desconfiando de este campo.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const hoy = hoyEnBogota();
  const { validas } = revisar(FUENTES, hoy);

  const ultimaRevision = validas.reduce(
    (max, f) => (f.revisado > max ? f.revisado : max),
    '1970-01-01',
  );

  return [
    {
      url: `${SITIO}/`,
      lastModified: new Date(ultimaRevision),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITIO}/privacidad`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
