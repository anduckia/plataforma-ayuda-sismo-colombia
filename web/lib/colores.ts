/**
 * El código de color del mapa, en un solo sitio porque lo usan tres piezas: los
 * puntos del mapa, el borde de cada tarjeta del listado y la leyenda. Si se
 * separan, la leyenda acaba mintiendo sobre lo que se ve en el mapa.
 *
 * Dos escalas distintas a propósito (RF-16):
 *  - Auxilio: rojo → naranja → ámbar, que es la escala de urgencia del sitio.
 *  - Búsqueda de familiar: azul. No tiene urgencia que escalar y se lee como
 *    otra cosa de un vistazo, que es justo lo que necesita quien tría.
 */

import type { Solicitud } from './ushahidi';

export const AZUL_BUSQUEDA = '#23479B';
export const GRIS_SIN = '#4A453E';

export const COLORES = {
  critica: '#C1121F',
  alta: '#D9541A',
  media: '#B8860B',
  busqueda: AZUL_BUSQUEDA,
  sin: GRIS_SIN,
} as const;

export type Nivel = keyof typeof COLORES;

/** Nivel de una solicitud: el tipo manda sobre la urgencia. */
export function nivelDe(s: Pick<Solicitud, 'tipo' | 'urgencia'>): Nivel {
  if (s.tipo === 'busqueda') return 'busqueda';
  if (!s.urgencia) return 'sin';
  if (s.urgencia.includes('CRÍTICA')) return 'critica';
  if (s.urgencia.includes('ALTA')) return 'alta';
  if (s.urgencia.includes('MEDIA')) return 'media';
  return 'sin';
}

export const colorDe = (s: Pick<Solicitud, 'tipo' | 'urgencia'>) => COLORES[nivelDe(s)];

/** Lo que dice la leyenda, en el orden en que se lee la gravedad. */
export const LEYENDA: { nivel: Nivel; texto: string }[] = [
  { nivel: 'critica', texto: 'Crítica' },
  { nivel: 'alta', texto: 'Alta' },
  { nivel: 'media', texto: 'Media' },
  { nivel: 'sin', texto: 'Sin urgencia indicada' },
  { nivel: 'busqueda', texto: 'Busco a un familiar' },
];
