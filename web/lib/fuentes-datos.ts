import type { Fuente, Vacio } from './fuentes';

/**
 * El contenido del directorio.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * POR QUÉ ESTÁ VACÍO
 * ─────────────────────────────────────────────────────────────────────────
 * Cargar una fuente exige comprobar que es quien dice ser (§5 del spec 05), y
 * eso no lo puede hacer quien escribió este archivo: la suplantación después
 * de un desastre es rutinaria, y un enlace equivocado en un directorio de
 * emergencia desvía a alguien que necesita ayuda hoy.
 *
 * Sembrarlo con fuentes «probables» sería exactamente el error que el
 * directorio existe para no cometer. Así que arranca vacío y la página lo dice
 * en voz alta: es T-069, y es tarea de una persona.
 *
 * Cuando la hoja de cálculo esté conectada (T-061) este archivo pasa a ser el
 * respaldo de lo último bueno; la forma no cambia.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * CÓMO SE CARGA UNA FUENTE
 *
 *   {
 *     id: 'albergues-manizales',        // slug estable, no se cambia después
 *     tema: 'albergues',
 *     nombre: 'Albergues habilitados en Manizales',
 *     quien: 'Alcaldía de Manizales',
 *     que: 'Listado de albergues abiertos, con dirección y cupo disponible.',
 *     zona: 'Manizales, Caldas',        // omítelo si no se sabe con certeza
 *     revisado: '2026-08-13',
 *     comprobacion: 'Enlazada desde el pie de manizales.gov.co el 13-ago.',
 *     principal: { tipo: 'pagina', enlace: 'https://manizales.gov.co/albergues' },
 *     otros: [{ tipo: 'telefono', numero: '606 887 9700' }],
 *   }
 *
 * Una cuenta se guarda por usuario, no por URL — la URL se deriva sola:
 *
 *   {
 *     id: 'ollas-pereira',
 *     tema: 'humanitaria',
 *     nombre: 'Ollas comunitarias de Pereira',
 *     quien: 'Organizaciones sociales de Pereira',
 *     que: 'Publican a diario dónde cocinan y qué les hace falta ese día.',
 *     zona: 'Pereira, Risaralda',
 *     revisado: '2026-08-13',
 *     comprobacion: 'La alcaldía las mencionó por nombre en rueda de prensa del 12-ago.',
 *     principal: { tipo: 'instagram', cuenta: '@usuario' },
 *     otros: [{ tipo: 'whatsapp', enlace: 'https://chat.whatsapp.com/…' }],
 *   }
 *
 * REGLAS QUE NO SE SALTAN
 * - Sin `revisado` y sin `comprobacion` la ficha no se pinta. Falla cerrado.
 * - La fecha cubre la ficha ENTERA: si tiene tres canales, los tres se
 *   miraron ese día. Por eso el máximo son dos secundarios.
 * - Cuentas sí, publicaciones no. Nunca una oferta individual («salgo mañana
 *   con la camioneta»): muere en horas y convierte al sitio en aval de alguien
 *   a quien nadie comprobó.
 * - Nunca la cuenta personal de un particular como si fuera una organización.
 * - Dos destinos de la misma organización con propósitos distintos son dos
 *   fichas, y normalmente caen en secciones distintas.
 */
export const FUENTES: Fuente[] = [];

/**
 * Lo que se buscó y no se encontró (RF-35).
 *
 * Va al final de su sección. Se escribe SOLO cuando alguien buscó de verdad:
 * decir «no encontramos fuente confiable de vías cerradas para Chocó» afirma
 * que se miró. Una sección sin nota se pinta igual, con el texto neutro que
 * pone la página, que no presume ninguna búsqueda.
 *
 *   { tema: 'vias',
 *     texto: 'No encontramos fuente confiable de vías cerradas para Chocó. ' +
 *            'Buscamos en los canales departamentales y en las cuentas que ' +
 *            'reportan tráfico; lo que hay son publicaciones sueltas que no ' +
 *            'se actualizan.',
 *     cola: 'Si conoces una, escríbenos: es lo que más nos están pidiendo.' }
 */
export const VACIOS: Vacio[] = [];
