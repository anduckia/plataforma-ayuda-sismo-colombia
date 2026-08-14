/**
 * Los canales del propio proyecto: a dónde escribe quien quiere aportar una
 * fuente que falta, o pedir que corrijamos algo (RF-19, RF-35).
 *
 * Van en variables de entorno y no en el código porque cambian entre
 * despliegues, y porque este repo se publica: un correo escrito aquí acaba en
 * los rastreadores de spam el mismo día.
 */

export const CONTACTO =
  process.env.NEXT_PUBLIC_CONTACTO?.trim() || 'sossismocolombia@gmail.com';

export const HAY_CONTACTO = Boolean(CONTACTO);

/**
 * Cuentas del proyecto para recibir mensajes directos.
 *
 * Se piden como usuario, no como URL, igual que las fuentes del directorio.
 * Si no están configuradas **no se pinta el enlace**: un botón de «escríbenos
 * por Instagram» que lleva a una cuenta inexistente es peor que no tenerlo,
 * porque quien tenía una fuente que aportar se va creyendo que ya la mandó.
 */
const usuario = (v: string | undefined) => v?.trim().replace(/^@/, '') || null;

export const INSTAGRAM = usuario(process.env.NEXT_PUBLIC_INSTAGRAM);
export const FACEBOOK = usuario(process.env.NEXT_PUBLIC_FACEBOOK);

/** Los mensajes directos, ya resueltos a URL. Solo los que existen. */
export const MENSAJES_DIRECTOS = [
  INSTAGRAM && { red: 'Instagram', href: `https://instagram.com/${INSTAGRAM}` },
  FACEBOOK && { red: 'Facebook', href: `https://facebook.com/${FACEBOOK}` },
].filter(Boolean) as { red: string; href: string }[];
