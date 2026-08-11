/**
 * A dónde escribe quien quiere que borremos sus datos (RF-19).
 *
 * Va en una variable de entorno y no en el código porque el correo del equipo
 * cambia entre despliegues, y porque este repo se publica: un correo escrito
 * aquí acaba en los rastreadores de spam el mismo día.
 *
 * Si no está configurada se enseña el marcador entre corchetes, igual que
 * `[NUMERO_SMS]` en el YAML: es feo a propósito, para que se note en la
 * revisión antes de difundir y no pase por bueno un canal que no existe.
 */
export const CONTACTO =
  process.env.NEXT_PUBLIC_CONTACTO?.trim() || '[CORREO_DEL_EQUIPO — configúralo antes de difundir]';

/** ¿Hay un canal de verdad, o seguimos con el marcador? */
export const HAY_CONTACTO = Boolean(process.env.NEXT_PUBLIC_CONTACTO?.trim());
