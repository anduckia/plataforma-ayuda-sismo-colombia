import type { Fuente, Vacio } from './fuentes';

/**
 * El contenido del directorio.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CÓMO SE CARGÓ ESTA PRIMERA TANDA (T-069)
 * ─────────────────────────────────────────────────────────────────────────
 * Cada ficha de aquí abajo se abrió el 14-ago-2026, una por una, y se escribió
 * a partir de lo que la propia página dice de sí misma. Nada se dedujo del
 * nombre del dominio ni de lo que «suena» oficial.
 *
 * Tres reglas gobernaron qué entró y qué no:
 *
 * 1. Si la página no declara quién la hace, `quien` dice «No identificado» y
 *    la comprobación lo dice también. Inventar un responsable es peor que no
 *    tenerlo: quien lee decide con esa información.
 * 2. Si el destino no cargó, no se publica — aunque venga en la lista. Falla
 *    cerrado (§5 del spec 05).
 * 3. Cuentas personales de particulares, fuera, por más seguidores que tengan.
 *
 * Lo que se revisó y quedó FUERA, para que nadie lo vuelva a intentar sin
 * saber por qué se cayó:
 *
 * - `smartlink2.metricool.com/public/smartlink/cruzrojabogota` — agregador de
 *   enlaces de Cruz Roja Bogotá. No cargó en ninguna de las tres visitas: se
 *   queda en «Loading, please wait…». No se puede comprobar a dónde manda, así
 *   que no se manda a nadie. El canal institucional de la Cruz Roja sí está
 *   cargado abajo.
 * - Una cuenta de Instagram de una veterinaria que está convocando voluntarios
 *   estos días. Es la cuenta personal de una particular, y §5 lo prohíbe
 *   expresamente: listarla aquí le echa encima un volumen de mensajes que no
 *   pidió. Si el equipo confirma que ella quiere estar, entra — pero es una
 *   decisión suya, no nuestra.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * CÓMO SE CARGA UNA FUENTE
 *
 *   {
 *     id: 'acopio-manizales',           // slug estable, no se cambia después
 *     tema: 'voluntariado',
 *     nombre: 'Centros de acopio de Manizales',
 *     quien: 'Alcaldía de Manizales',
 *     que: 'Listado de centros abiertos, con dirección y qué están recibiendo.',
 *     zona: 'Manizales, Caldas',        // omítelo si no se sabe con certeza
 *     revisado: '2026-08-13',
 *     comprobacion: 'Enlazada desde el pie de manizales.gov.co el 13-ago.',
 *     principal: { tipo: 'pagina', enlace: 'https://manizales.gov.co/acopio' },
 *     otros: [{ tipo: 'telefono', numero: '606 887 9700' }],
 *   }
 *
 * Una cuenta se guarda por usuario, no por URL — la URL se deriva sola:
 *
 *   {
 *     id: 'ollas-pereira',
 *     tema: 'voluntariado',
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
 *
 * El orden DENTRO de cada sección es el de este arreglo, así que lo primero de
 * cada bloque es lo primero que ve quien llega a esa sección.
 */
export const FUENTES: Fuente[] = [
  /* ──────────────────────────────── voluntariado y centros de acopio ── */
  {
    id: 'mapa-puntos-ayuda',
    tema: 'voluntariado',
    nombre: 'Mapa vivo de puntos de ayuda',
    quien: 'Artefacto',
    que:
      'Dónde faltan manos, qué se necesita en cada punto y dónde ya no hace falta ' +
      'acudir, con la hora de la última confirmación de cada uno.',
    zona: 'Valle del Cauca, Chocó y Cauca',
    revisado: '2026-08-14',
    comprobacion:
      'El mapa firma al pie y enlaza al sitio de quien lo hace. Abierto el 14-ago: ' +
      'casi 800 puntos, con actualizaciones de hace minutos.',
    principal: {
      tipo: 'mapa',
      enlace: 'https://mapa-emergencia.artefactofilms.workers.dev/',
    },
  },
  {
    id: 'voluntariado-bogota-medellin',
    tema: 'voluntariado',
    nombre: 'Dónde piden voluntarios hoy',
    quien: 'No identificado',
    que:
      'Hoja abierta con los puntos que están pidiendo gente: dirección, horarios, ' +
      'qué se hace allí y enlace de inscripción, con la hora de cada actualización.',
    zona: 'Bogotá y Medellín',
    revisado: '2026-08-14',
    comprobacion:
      'El documento no declara responsable ni dice pertenecer a ninguna entidad. ' +
      'Abierto el 14-ago: tres pestañas —voluntariado y donaciones— con filas ' +
      'actualizadas esa misma mañana.',
    principal: {
      tipo: 'documento',
      enlace:
        'https://docs.google.com/spreadsheets/d/1-hMGwC0XaSu5ddZ896gYyVRpmbPkVYg3NJ_6rSxK4Y8/htmlview',
    },
  },
  {
    id: 'acopio-centros',
    tema: 'voluntariado',
    nombre: 'Centros de acopio: qué falta y dónde sobra',
    quien: 'No identificado',
    que:
      'Por ciudad, los centros de acopio abiertos con su dirección y lo que tienen ' +
      'de más o de menos ese día; marca aparte lo urgente.',
    zona: 'Eje Cafetero, Valle del Cauca, Tolima y Bogotá',
    revisado: '2026-08-14',
    comprobacion:
      'La página no declara responsable y tampoco dice ser de ninguna entidad, así que ' +
      'no hay identidad que suplantar. Abierta el 14-ago: 65 centros cargados y ' +
      'necesidades con hora de actualización de ese mismo día.',
    principal: { tipo: 'pagina', enlace: 'https://ayudaspereira.com/' },
  },
  {
    id: 'huellas-mascotas',
    tema: 'voluntariado',
    nombre: 'Huellas: mascotas perdidas y encontradas',
    quien: 'No identificado',
    que:
      'Reportas una mascota perdida, avisas que encontraste una, o pides alimento, ' +
      'refugio temporal o atención veterinaria para la tuya.',
    revisado: '2026-08-14',
    comprobacion:
      'La página se presenta como herramienta comunitaria y no dice ser de ninguna ' +
      'entidad. Abierta el 14-ago, con reportes activos en las tres secciones.',
    principal: { tipo: 'pagina', enlace: 'https://emergencia-mascotas.vercel.app/' },
  },

  /* ───────────────────────────────────────────────────────── donaciones ── */
  {
    id: 'bancos-de-alimentos',
    tema: 'donaciones',
    nombre: 'Llevar comida a un banco de alimentos',
    quien: 'Asociación de Bancos de Alimentos de Colombia (ABACO)',
    que:
      'Recibe productos en sus puntos de acopio de Armenia, Cali, Istmina, ' +
      'Buenaventura, Medellín e Ibagué, y también aportes en dinero.',
    revisado: '2026-08-14',
    comprobacion:
      'Subdominio de abaco.org.co; la página identifica a la asociación con su NIT y ' +
      'lista sus puntos de acopio con dirección. Abierta el 14-ago.',
    principal: { tipo: 'pagina', enlace: 'https://donahoy.abaco.org.co/colombia2026' },
  },
  {
    id: 'cruz-roja-aportes',
    tema: 'donaciones',
    nombre: 'Aportar a la respuesta de la Cruz Roja',
    quien: 'Cruz Roja Colombiana',
    que:
      'Canal propio de la organización para aportar dinero a su operación: salud, ' +
      'agua, búsqueda y rescate, reunificación familiar y kits de emergencia.',
    zona: 'Todo el país',
    revisado: '2026-08-14',
    comprobacion:
      'Subdominio de cruzrojacolombiana.org, el dominio institucional de la ' +
      'organización. Abierto el 14-ago.',
    principal: { tipo: 'pagina', enlace: 'https://ayuda.cruzrojacolombiana.org/' },
  },
  {
    id: 'fundacion-plan-emergencia',
    tema: 'donaciones',
    nombre: 'Respuesta con enfoque en niñez y familias',
    quien: 'Fundación PLAN',
    que:
      'Detalla en qué se usan los aportes —alojamiento temporal, alimentos, agua y ' +
      'kits de higiene, espacios seguros para niñas y niños— y los recibe.',
    zona: 'Chocó y otras zonas afectadas',
    revisado: '2026-08-14',
    comprobacion:
      'Página dentro de plan.org.co, dominio de la fundación, enlazada desde su ' +
      'portada. Abierta el 14-ago.',
    principal: {
      tipo: 'pagina',
      enlace: 'https://plan.org.co/quiero-ayudar/terremoto-en-colombia/',
    },
  },

  /* ────────────────────────────────────────────────────── links de ayuda ── */
  {
    id: 'medicina-legal-desaparecidos',
    tema: 'ayuda',
    nombre: 'Reportar a una persona desaparecida',
    quien: 'Instituto Nacional de Medicina Legal y Ciencias Forenses',
    que:
      'Dónde y cómo reportar, qué datos y documentos llevar, y en qué sedes se ' +
      'atiende. No hay que esperar 24 ni 48 horas para reportar.',
    zona: 'Todo el país',
    revisado: '2026-08-14',
    comprobacion:
      'Dominio institucional medicinalegal.gov.co; la página del servicio está ' +
      'enlazada desde la portada del instituto. Abierta el 14-ago.',
    principal: {
      tipo: 'pagina',
      enlace:
        'https://www.medicinalegal.gov.co/servicios-a-la-ciudadania/servicios/busqueda-de-personas-desaparecidas',
    },
    otros: [{ tipo: 'telefono', numero: '01800 519 0565' }],
  },
  {
    id: 'colombia-te-busca',
    tema: 'ayuda',
    nombre: 'Colombia te busca',
    quien: 'Iniciativa ciudadana, voluntaria y sin ánimo de lucro',
    que:
      'Registro abierto para reportar y consultar personas por localizar tras el ' +
      'sismo; cada caso dice si ya apareció.',
    zona: 'Todo el país',
    revisado: '2026-08-14',
    comprobacion:
      'La propia página declara ser ciudadana y voluntaria, y advierte que no ' +
      'reemplaza a las autoridades ni a los organismos de emergencia. Abierta el ' +
      '14-ago, con registros nuevos de ese mismo día.',
    principal: { tipo: 'pagina', enlace: 'https://colombiatebusca.com/' },
  },
  /*
    SismoAyuda va de última en la sección, por decisión del equipo (14-ago).
    Antes eran dos fichas —reportar tu edificación y registrarte como inspector—
    porque RF-33 pide ficha aparte por cada propósito distinto. El equipo quiso
    una sola, así que el registro de ingenieros baja a canal secundario: sigue
    alcanzable de un toque y no se pierde, pero deja de anunciarse solo.
  */
  {
    id: 'sismoayuda-evaluacion',
    tema: 'ayuda',
    nombre: '¿Tu edificación quedó dañada?',
    quien: 'SismoAyuda, red voluntaria de ingenieros y arquitectos',
    que:
      'Envías fotos de los daños y un ingeniero voluntario te devuelve por correo ' +
      'una evaluación preliminar de si la edificación se puede habitar. Ahí mismo se ' +
      'registran los profesionales que quieran evaluar.',
    revisado: '2026-08-14',
    comprobacion:
      'El sitio explica quién lo opera —un equipo voluntario nacido en Venezuela— y ' +
      'publica cuenta de Instagram y correo de contacto. Advierte por su cuenta que su ' +
      'evaluación no sustituye la inspección oficial. Abierto el 14-ago.',
    principal: { tipo: 'formulario', enlace: 'https://sismoayudaco.com/reportar' },
    otros: [
      { tipo: 'mapa', enlace: 'https://sismoayudaco.com/mapa' },
      { tipo: 'formulario', enlace: 'https://sismoayudaco.com/inspector/registro' },
    ],
  },

  /* ────────────────────────────────────────────────── vías y transporte ── */
  {
    id: 'invias-emergencias-viales',
    tema: 'vias',
    nombre: 'Emergencias en carretera por fenómenos naturales',
    quien: 'Instituto Nacional de Vías (Invías)',
    que:
      'Tablero de la entidad con las emergencias viales del año asociadas a ' +
      'fenómenos naturales: dónde hay cierre o paso restringido y en qué estado va.',
    zona: 'Red vial nacional',
    revisado: '2026-08-14',
    comprobacion:
      'Publicación dentro de invias.gov.co, el dominio institucional del instituto. ' +
      'Revisada por el equipo el 14-ago.',
    principal: {
      tipo: 'pagina',
      enlace: 'https://www.invias.gov.co/publicaciones/8709/reporte-de-emergencias/',
    },
    otros: [{ tipo: 'telefono', numero: '01 8000 117844' }],
  },

  /* ───────────────────────────────────────── información oficial ── */
  {
    id: 'sgc-sismos',
    tema: 'oficial',
    nombre: 'Sismos y réplicas registrados',
    quien: 'Servicio Geológico Colombiano',
    que:
      'Cada sismo y cada réplica con magnitud, profundidad, hora y municipios ' +
      'cercanos, según los registra la red del país.',
    zona: 'Todo el país',
    revisado: '2026-08-14',
    comprobacion:
      'Dominio institucional sgc.gov.co; el visor está enlazado desde su portada. ' +
      'Abierto el 14-ago, con réplicas de San José del Palmar de esa mañana.',
    principal: { tipo: 'mapa', enlace: 'https://www.sgc.gov.co/sismos' },
  },
  {
    id: 'defensoria-terremoto',
    tema: 'oficial',
    nombre: 'Tus derechos después del terremoto',
    quien: 'Defensoría del Pueblo',
    que:
      'Qué hacer y qué no en estos días, y qué puedes exigir en salud, vivienda y ' +
      'atención; también publica su seguimiento a las zonas afectadas.',
    zona: 'Todo el país',
    revisado: '2026-08-14',
    comprobacion:
      'Dominio institucional defensoria.gov.co; la sección del terremoto está ' +
      'enlazada desde su portada. Abierta el 14-ago.',
    principal: {
      tipo: 'pagina',
      enlace: 'https://www.defensoria.gov.co/terremoto-colombia',
    },
    otros: [{ tipo: 'telefono', numero: '01 8000 914 814' }],
  },
  {
    id: 'itagui-reporte-emergencias',
    tema: 'oficial',
    nombre: 'Reportar una emergencia en Itagüí',
    quien: 'Alcaldía de Itagüí',
    que:
      'Formulario del municipio para que la ciudadanía y las entidades reporten ' +
      'emergencias y la alcaldía priorice la atención.',
    zona: 'Itagüí, Antioquia',
    revisado: '2026-08-14',
    comprobacion:
      'El pie del formulario lo firma la dirección de tecnologías de la Alcaldía de ' +
      'Itagüí. Abierto el 14-ago.',
    principal: {
      tipo: 'formulario',
      enlace: 'https://survey123.arcgis.com/share/fe89d3b0769e4fb1bbf8215526aa416d',
    },
  },
];

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
 *
 * SIGUE VACÍO A PROPÓSITO. Las fuentes cargadas salieron de revisar una lista
 * que ya existía, no de salir a buscar por tema. «Quién documenta» quedó en
 * cero, pero nadie ha buscado para esa sección todavía, y escribir aquí que
 * buscamos sería afirmar un trabajo que no se hizo. Mientras tanto la página
 * pone su texto neutro, que solo dice que no hemos cargado nada — que es lo
 * único cierto.
 */
export const VACIOS: Vacio[] = [];
