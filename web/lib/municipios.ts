/**
 * Los 125 municipios de los cinco departamentos afectados (RF-21, ADR-020).
 *
 * Existe por una razón operativa, no de pulcritud: con texto libre no se puede
 * saber **dónde no ha reportado nadie**. «Dosquebradas» escrito de tres formas
 * son tres municipios, «Pereira» acaba en Antioquia y «No se, Choco» no es un
 * lugar. La capa de silencio se calcula contra esta lista: es el denominador.
 *
 * Ojo con los homónimos, que es justo por lo que el departamento viaja pegado
 * al municipio y nunca se guarda suelto: **Riosucio** existe en Chocó y en
 * Caldas, y **Risaralda** es a la vez municipio de Caldas y departamento.
 *
 * Fuente: división político-administrativa del DANE (DIVIPOLA).
 */

export const DEPARTAMENTOS = [
  'Chocó', 'Valle del Cauca', 'Risaralda', 'Quindío', 'Caldas',
] as const;

export type Departamento = (typeof DEPARTAMENTOS)[number];

export const MUNICIPIOS: Record<Departamento, string[]> = {
  'Chocó': [
    'Acandí', 'Alto Baudó', 'Atrato', 'Bagadó', 'Bahía Solano', 'Bajo Baudó',
    'Bojayá', 'Carmen del Darién', 'Cértegui', 'Condoto', 'El Cantón del San Pablo',
    'El Carmen de Atrato', 'El Litoral del San Juan', 'Istmina', 'Juradó', 'Lloró',
    'Medio Atrato', 'Medio Baudó', 'Medio San Juan', 'Nóvita', 'Nuquí', 'Quibdó',
    'Río Iró', 'Río Quito', 'Riosucio', 'San José del Palmar', 'Sipí', 'Tadó',
    'Unguía', 'Unión Panamericana',
  ],
  'Valle del Cauca': [
    'Alcalá', 'Andalucía', 'Ansermanuevo', 'Argelia', 'Bolívar', 'Buenaventura',
    'Bugalagrande', 'Caicedonia', 'Cali', 'Calima', 'Candelaria', 'Cartago',
    'Dagua', 'El Águila', 'El Cairo', 'El Cerrito', 'El Dovio', 'Florida',
    'Ginebra', 'Guacarí', 'Guadalajara de Buga', 'Jamundí', 'La Cumbre',
    'La Unión', 'La Victoria', 'Obando', 'Palmira', 'Pradera', 'Restrepo',
    'Riofrío', 'Roldanillo', 'San Pedro', 'Sevilla', 'Toro', 'Trujillo', 'Tuluá',
    'Ulloa', 'Versalles', 'Vijes', 'Yotoco', 'Yumbo', 'Zarzal',
  ],
  'Risaralda': [
    'Apía', 'Balboa', 'Belén de Umbría', 'Dosquebradas', 'Guática', 'La Celia',
    'La Virginia', 'Marsella', 'Mistrató', 'Pereira', 'Pueblo Rico', 'Quinchía',
    'Santa Rosa de Cabal', 'Santuario',
  ],
  'Quindío': [
    'Armenia', 'Buenavista', 'Calarcá', 'Circasia', 'Córdoba', 'Filandia',
    'Génova', 'La Tebaida', 'Montenegro', 'Pijao', 'Quimbaya', 'Salento',
  ],
  'Caldas': [
    'Aguadas', 'Anserma', 'Aranzazu', 'Belalcázar', 'Chinchiná', 'Filadelfia',
    'La Dorada', 'La Merced', 'Manizales', 'Manzanares', 'Marmato', 'Marquetalia',
    'Marulanda', 'Neira', 'Norcasia', 'Pácora', 'Palestina', 'Pensilvania',
    'Riosucio', 'Risaralda', 'Salamina', 'Samaná', 'San José', 'Supía',
    'Victoria', 'Villamaría', 'Viterbo',
  ],
};

/** Etiqueta de la salida de escape. Cerrar la lista sin salida excluye (RF-21). */
export const OTRO = 'Otro / no está en la lista';

/**
 * Separa el municipio del detalle fino. El prefijo —lo que va antes— es lo que
 * agrupa; lo de después es la precisión rural que la gente ya escribía a mano y
 * que una lista cerrada, sola, habría tirado a la basura.
 */
export const SEPARADOR = ' — ';

/** `Pereira, Risaralda — vereda El Carmen` */
export function componer(
  municipio: string,
  departamento: string,
  detalle: string,
): string {
  const lugar = municipio && departamento ? `${municipio}, ${departamento}` : municipio;
  // Sin municipio no hay valor: una vereda suelta pasaría la comprobación de
  // campo obligatorio sin decir dónde está. El detalle no se pierde — sigue
  // escrito en el formulario y reaparece en cuanto se elige el municipio.
  if (!lugar) return '';
  const fino = detalle.trim();
  return fino ? `${lugar}${SEPARADOR}${fino}` : lugar;
}

export const TOTAL_MUNICIPIOS = Object.values(MUNICIPIOS)
  .reduce((n, lista) => n + lista.length, 0);
