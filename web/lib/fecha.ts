/**
 * La fecha de revisión y cómo envejece (RF-34).
 *
 * Es la señal de confianza del directorio, y su fuerza no está en el peso
 * visual sino en que **envejece sola**: a los tres días, sin que nadie toque
 * nada, la ficha empieza a decir que hace rato que nadie vuelve a mirar. Una
 * insignia de «verificado» no puede hacer eso, y por eso se puede falsificar.
 */

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/**
 * El día de hoy en Bogotá, en AAAA-MM-DD.
 *
 * El servidor puede estar en cualquier huso. Sin fijarlo, una revisión hecha a
 * las 8 p.m. en Colombia se lee como «mañana» en un servidor europeo y la
 * validación la descarta por estar en el futuro. `en-CA` da directamente el
 * formato ISO, que es justo el que se compara como texto.
 */
export function hoyEnBogota(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(ahora);
}

const aUtc = (iso: string) => Date.parse(`${iso}T00:00:00Z`);

export const diasDesde = (revisado: string, hoy: string): number =>
  Math.max(0, Math.round((aUtc(hoy) - aUtc(revisado)) / 86_400_000));

/** «13 de agosto» — escrita, no 13/08/2026: un número se lee como metadato. */
export function enPalabras(iso: string): string {
  const [, mes, dia] = iso.split('-');
  return `${Number(dia)} de ${MESES[Number(mes) - 1]}`;
}

export interface Revisado {
  /** Lo que se lee en la ficha. */
  texto: string;
  /** A partir de 8 días la antigüedad se pinta en color de alerta. */
  alerta: boolean;
  dias: number;
}

/**
 * Los tres estados. El aspecto escala con la antigüedad y **solo** con ella:
 * no hay nada que nadie tenga que acordarse de marcar.
 *
 * Hasta 3 días basta la fecha. De 4 a 7 se añade lo transcurrido, porque a esa
 * altura el lector ya no calcula solo cuánto hace. Desde 8 manda lo
 * transcurrido y se pinta en alerta: la fecha absoluta pasa a estorbar cuando
 * lo que hay que saber es que esto lleva demasiado sin mirarse.
 */
export function estadoDeRevision(revisado: string, hoy: string): Revisado {
  const dias = diasDesde(revisado, hoy);

  if (dias <= 3) {
    return { texto: `Revisado el ${enPalabras(revisado)}`, alerta: false, dias };
  }
  if (dias <= 7) {
    return {
      texto: `Revisado el ${enPalabras(revisado)} · hace ${dias} días`,
      alerta: false,
      dias,
    };
  }
  return { texto: `Revisado hace ${dias} días`, alerta: true, dias };
}

/**
 * El estado agregado del inventario, para la cabecera (RF-34).
 *
 * Va antes del índice a propósito: es la promesa del sitio. Y dice lo malo —
 * cuántas llevan demasiado— porque prometer «todo» es justo lo que este
 * directorio no hace. Promete lo revisado.
 */
export function resumenDelInventario(fechas: string[], hoy: string) {
  const dias = fechas.map((f) => diasDesde(f, hoy)).sort((a, b) => a - b);
  return {
    total: fechas.length,
    masReciente: dias[0] ?? null,
    masAntigua: dias[dias.length - 1] ?? null,
    vencidas: dias.filter((d) => d > 7).length,
  };
}

/** «hoy» · «ayer» · «hace 3 días», para el resumen de la cabecera. */
export function haceCuanto(dias: number): string {
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  return `hace ${dias} días`;
}
