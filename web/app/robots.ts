import type { MetadataRoute } from 'next';
import { SITIO } from '@/lib/sitio';

/**
 * Dentro de los buscadores (RF-38, revierte RF-19).
 *
 * Hasta el 14-ago-2026 este archivo decía `Disallow: /`. El motivo era el mapa:
 * publicaba nombres de personas desaparecidas —de menores incluidos— y Google
 * no olvida, así que una búsqueda por el nombre de una niña habría seguido
 * devolviendo «Busco a un familiar» años después de que apareciera.
 *
 * Ese motivo desapareció con el mapa y los formularios (RF-37). Lo que queda
 * servido en la cara pública son organizaciones, sus canales y sus líneas
 * institucionales: nada de una persona identificable. Con la condición previa
 * de RF-38 confirmada, el bloqueo pasa de proteger a estorbar — un directorio
 * que nadie encuentra no ayuda a nadie, y la búsqueda es el único canal de
 * difusión que no depende de que alguien reenvíe el enlace.
 *
 * Las páginas de lo retirado NO se bloquean aquí: llevan `noindex` en su propia
 * metadata, que es lo correcto para contenido delgado. Bloquearlas por
 * robots.txt sería contraproducente —el rastreador no podría leer el `noindex`
 * que le pide justamente eso—.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITIO}/sitemap.xml`,
    host: SITIO,
  };
}
