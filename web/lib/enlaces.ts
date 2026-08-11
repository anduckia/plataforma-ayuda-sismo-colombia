/**
 * Canales oficiales (RF-25, ADR-022). Fuente única para todas las páginas.
 *
 * Dos reglas que no se negocian:
 *
 *  1. **Se enlaza, no se transcribe.** Ni un número de cuenta bancaria entra
 *     aquí. Un dígito mal copiado manda el dinero de alguien al lugar
 *     equivocado y el error sería nuestro; enlazar deja el dato en manos de
 *     quien lo emite y lo mantiene. Además sostiene la promesa de que aquí
 *     nunca se toca dinero (RNF-03).
 *  2. **Cada dato lleva de dónde salió y cuándo se comprobó.** Publicar una
 *     línea de emergencia equivocada en un desastre es daño propio, no un
 *     error de copia.
 *
 * Todos los enlaces de este archivo se comprobaron uno a uno el 11-ago-2026 y
 * respondían HTTP 200.
 */

export const VERIFICADO = '11 de agosto de 2026';

export interface Linea {
  numero: string;
  quien: string;
  nota?: string;
}

/**
 * Nacionales y gratuitas. El 123 vive aparte, arriba del todo y en todas las
 * páginas (RNF-06): aquí está por completitud, no para competir con él.
 */
export const LINEAS: Linea[] = [
  { numero: '123', quien: 'Línea única de emergencias', nota: 'Policía, Bomberos, Ambulancia y Defensa Civil. Si hay una vida en riesgo ahora, esta es la primera.' },
  { numero: '112', quien: 'Policía Nacional' },
  { numero: '132', quien: 'Cruz Roja Colombiana' },
  { numero: '144', quien: 'Defensa Civil' },
  { numero: '119', quien: 'Bomberos' },
  { numero: '125', quien: 'Ambulancias y emergencias médicas' },
  { numero: '111', quien: 'Atención de desastres' },
];

/**
 * Celulares que publicó la Defensa Civil del **Chocó**, no nacionales: el
 * epicentro cae a unos 20 km de San José del Palmar y allí la línea fija no
 * siempre entra. Etiquetarlos como nacionales mandaría a medio país a un
 * teléfono de Quibdó.
 */
export const DEFENSA_CIVIL_CHOCO = ['310 330 5140', '311 356 2952'];

export interface Enlace {
  titulo: string;
  url: string;
  /** Qué hace exactamente, para que nadie llame en balde. */
  que: string;
  /** Se muestra tal cual junto al enlace. */
  detalle?: string;
}

/** T-039 · Búsqueda de familiares. `/busco-familiar` sigue activo (RF-25). */
export const FAMILIARES: Enlace[] = [
  {
    titulo: 'Cruz Roja Colombiana — Restablecimiento del Contacto entre Familiares',
    url: 'https://ayuda.cruzrojacolombiana.org/',
    que: 'El canal con más alcance para localizar a alguien y para mandar un «estoy bien». ' +
      'Es el primero al que hay que escribir.',
    detalle: 'Correo rcf@cruzrojacolombiana.org · WhatsApp 321 213 9525',
  },
  {
    titulo: 'Registro Nacional de Desaparecidos — Medicina Legal',
    url: 'https://www.medicinalegal.gov.co/',
    que: 'El registro oficial del Estado. Aquí es donde queda constancia legal de que ' +
      'una persona está desaparecida.',
  },
  {
    titulo: 'Colombia te busca',
    url: 'https://colombiatebusca.com/',
    que: 'Plataforma ciudadana de búsqueda tras el sismo.',
  },
];

/** T-040 · Vivienda dañada sin emergencia vital. */
export const VIVIENDA: Enlace[] = [
  {
    titulo: 'SismoAyuda Colombia',
    url: 'https://sismoayudaco.com/reportar',
    que: 'Subes fotos de los daños y un ingeniero voluntario te manda por correo un ' +
      'informe preliminar de si la casa es habitable. Sin registro.',
    detalle: 'Es una orientación técnica a partir de fotos: no reemplaza la inspección oficial presencial.',
  },
  {
    titulo: 'Itagüí — formulario municipal de reporte de daños',
    url: 'https://survey123.arcgis.com/share/fe89d3b0769e4fb1bbf8215526aa416d',
    que: 'Si estás en Itagüí, este es el reporte que le llega directo a tu alcaldía.',
    detalle: 'Línea del municipio: (604) 372 65 60',
  },
];

/**
 * T-041 · Donaciones. Enlaces, nunca números de cuenta (ADR-022).
 *
 * Los medios publican la cuenta de ABACO y su llave Bre-B; aquí no van a
 * propósito. Quien quiera donar entra a la página de la organización, que es
 * quien responde por ese dato.
 */
export const DONACIONES: Enlace[] = [
  {
    titulo: 'Cruz Roja Colombiana — Emergencia Sismo',
    url: 'https://ayuda.cruzrojacolombiana.org/',
    que: 'Donación en dinero y campaña de donación de sangre, que es de lo que más falta hace.',
  },
  {
    titulo: 'ABACO — Asociación de Bancos de Alimentos de Colombia',
    url: 'https://donahoy.abaco.org.co/colombia2026',
    que: 'Corredor humanitario de alimentos. Puntos físicos en Armenia, Cali y Manizales.',
  },
  {
    titulo: 'Fundación PLAN',
    url: 'https://www.plan.org.co/',
    que: 'Atención a niñas, niños y adolescentes afectados.',
  },
  {
    titulo: 'Puntos de acopio en Bogotá',
    url: 'https://bogota.gov.co/mi-ciudad/seguridad/puntos-de-donacion-en-bogota-para-damnificados-terremoto-en-colombia',
    que: 'Seis puntos habilitados por la Alcaldía y la Cruz Roja, con la lista de qué se recibe.',
  },
];

/** T-042 · Información oficial, incluida la de vías. */
export const INFORMACION: Enlace[] = [
  {
    titulo: 'UNGRD — Unidad Nacional para la Gestión del Riesgo de Desastres',
    url: 'https://portal.gestiondelriesgo.gov.co/',
    que: 'La coordinación nacional de la emergencia y los balances oficiales.',
  },
  {
    titulo: 'Servicio Geológico Colombiano',
    url: 'https://www.sgc.gov.co/',
    que: 'Magnitud, epicentro y réplicas. La fuente de verdad sobre el sismo.',
  },
  {
    titulo: 'Invías — estado de las vías',
    url: 'https://www.invias.gov.co/',
    que: 'Qué carreteras están cerradas y por dónde se puede pasar. Si vas a mover un ' +
      'convoy, mira esto antes de salir.',
  },
  {
    titulo: 'Defensoría del Pueblo',
    url: 'https://www.defensoria.gov.co/',
    que: 'Garantía de derechos durante la emergencia.',
  },
];

/**
 * La advertencia con la que se encabeza todo lo de arriba. Es de la Defensoría
 * del Pueblo y es la que más falta hace: tras un desastre circulan más cadenas
 * que datos, y las estafas de donaciones llegan antes que la ayuda.
 */
export const ADVERTENCIA =
  'La Defensoría del Pueblo pide no difundir información sin verificar y no reenviar ' +
  'cadenas de texto, audios, capturas ni videos de origen desconocido. Consulta solo ' +
  'canales oficiales: UNGRD, Servicio Geológico Colombiano, gobernaciones, alcaldías y ' +
  'organismos de socorro.';
