/**
 * Cuánto hace de las cosas (RF-23, RF-24, ADR-021).
 *
 * Dos usos distintos que conviene no confundir:
 *   · frescura  — hace cuánto miramos la plataforma. Es lo que da credibilidad.
 *   · caducidad — hace cuánto que una solicitud sigue sin que nadie confirme.
 */

/** A partir de aquí una solicitud sin confirmar avisa de cuánto lleva (RF-23). */
export const HORAS_SIN_CONFIRMAR = 12;

const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

/** «hace 3 minutos», «hace 14 horas», «hace 2 días». */
export function hace(desde: string | number, ahora: number = Date.now()): string | null {
  const t = typeof desde === 'number' ? desde : new Date(desde).getTime();
  if (!Number.isFinite(t)) return null;

  const ms = Math.max(0, ahora - t);
  if (ms < MINUTO) return 'hace unos segundos';
  if (ms < HORA) {
    const m = Math.floor(ms / MINUTO);
    return `hace ${m} ${m === 1 ? 'minuto' : 'minutos'}`;
  }
  if (ms < DIA) {
    const h = Math.floor(ms / HORA);
    return `hace ${h} ${h === 1 ? 'hora' : 'horas'}`;
  }
  const d = Math.floor(ms / DIA);
  return `hace ${d} ${d === 1 ? 'día' : 'días'}`;
}

export const horasDesde = (iso: string, ahora: number = Date.now()): number | null => {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? (ahora - t) / HORA : null;
};

/**
 * Cuánto lleva esperando una solicitud que nadie ha confirmado todavía.
 *
 * Devuelve null si ya está confirmada, si es demasiado reciente para que el
 * dato signifique algo, o si la fecha no se entiende. «Confirmada» es
 * pertenecer a la colección del equipo (RF-17): el campo «Verificación» no
 * cuenta porque cualquiera puede rellenarlo con `curl`.
 *
 * Esto **no** ordena ni atenúa nada, y no debe hacerlo (ADR-021): una crítica
 * de 14 horas sin confirmar no es basura vieja, es la que peor está.
 */
export function sinConfirmar(
  s: { fecha: string; verificada: boolean },
  ahora: number = Date.now(),
): string | null {
  if (s.verificada) return null;
  const h = horasDesde(s.fecha, ahora);
  if (h === null || h < HORAS_SIN_CONFIRMAR) return null;
  return hace(s.fecha, ahora);
}
