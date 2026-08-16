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
  /* ─────────────────────────────────────────── mapas en tiempo real ── */
  {
    id: 'mapa-puntos-ayuda',
    tema: 'mapas',
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
    id: 'mapa-voluntariado-bogota',
    tema: 'mapas',
    nombre: 'Voluntariado Bogotá - Agosto 2026',
    quien: 'Instagram: @stromanthetriostar',
    que:
      'Punto por punto en Bogotá: si ese día reciben voluntarios o donaciones, con ' +
      'horarios, enlaces de inscripción y la hora de la última actualización de cada lugar.',
    zona: 'Bogotá',
    revisado: '2026-08-15',
    comprobacion:
      'Lista compartida de Google Maps titulada «Voluntariado Bogotá - Agosto 2026», ' +
      'firmada por el usuario stromanthetriostar; 103 lugares con actualización por punto ' +
      'del 14-ago. Abierta el 15-ago. Quien la mantiene se identifica solo por su usuario ' +
      'e Instagram, no por una entidad.',
    principal: {
      tipo: 'mapa',
      etiqueta: 'Abrir en Google Maps',
      enlace:
        'https://www.google.com/maps/@4.7992087,-74.2883166,10.85z/data=!4m3!11m2!2sXJQY-o3hsph0A1kkDaEESw!3e3?entry=ttu&g_ep=EgoyMDI2MDgxMi4wIKXMDSoASAFQAw%3D%3D',
    },
  },
  {
    id: 'bengala-donde-llevar-ayuda',
    tema: 'mapas',
    nombre: 'Dónde llevar la ayuda',
    quien: 'Instagram: @leoncio.aja',
    que:
      'Puntos abiertos hoy en un mapa: dónde llevar donaciones, atención en salud, ' +
      'albergues y trámites, cada uno con el día y la hora en que se publicó.',
    revisado: '2026-08-15',
    comprobacion:
      'Abierta con lectura mínima el 15-ago: mapa con unos 369 puntos (donaciones, ' +
      'salud, albergues, trámites), cada uno con fecha y hora de publicación. El pie se ' +
      'declara solo —«lo hace la comunidad, no una entidad oficial»— y dice reunir lo que ' +
      'la gente publica para apoyar a las fuentes oficiales (UNGRD, alcaldías y ' +
      'gobernaciones). El equipo lo identifica con la cuenta de Instagram @leoncio.aja; ' +
      'el dominio bengalacol.org no nombra responsable, así que la identidad la sostienen ' +
      'esa cuenta y la declaración del propio sitio.',
    principal: { tipo: 'mapa', enlace: 'https://bengalacol.org/' },
  },
  {
    id: 'suma-plataforma-humanitaria',
    tema: 'mapas',
    nombre: 'SUMA Plataforma Humanitaria',
    quien: 'Instagram: @fposadat · difundido por @luchocloud',
    que:
      'Mapa de coordinación humanitaria: ubica albergues, agua potable y puntos de ' +
      'salud, y permite reportar emergencias o pedir ayuda (SOS). Los puntos están ' +
      'organizados por ciudad —Bogotá, Cali, Medellín, Eje Cafetero, Quibdó y Caribe.',
    zona: 'Bogotá, Cali, Medellín, Eje Cafetero, Quibdó y Caribe',
    revisado: '2026-08-15',
    comprobacion:
      'Abierta con lectura mínima el 15-ago: mapa de coordinación (Leaflet) con puntos ' +
      'por ciudad para ubicar albergues, agua y salud y reportar emergencias. El dominio ' +
      'suma.web.app (Firebase) no nombra responsable; el equipo lo identifica con la ' +
      'cuenta de Instagram @fposadat, difundida por @luchocloud, y esa cuenta es la que ' +
      'sostiene la identidad.',
    principal: { tipo: 'mapa', enlace: 'https://suma.web.app/' },
  },

  /* ──────────────────────────────── voluntariado y centros de acopio ── */
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
    id: 'puente-logistico',
    tema: 'voluntariado',
    nombre: 'Hay camiones listos. Hay acopios llenos. Falta conectarlos.',
    quien: 'Instagram contacto: @lacolombiajera @serinflorescencia',
    que:
      'Quién tiene vehículo y quién necesita uno para mover las ayudas, organizado a ' +
      'partir de los comentarios de una publicación de Instagram: una ficha por persona, ' +
      'con su comentario original completo y la fecha en que lo publicó.',
    revisado: '2026-08-15',
    comprobacion:
      'Confirmada por el equipo el 15-ago: la página está compartida públicamente y la ' +
      'operan dos personas, identificadas en Instagram como @lacolombiajera y ' +
      '@serinflorescencia. Es una página generada en claude.ai (un «artifact»), cuyo ' +
      'dominio no dice quién está detrás, así que la identidad la sostienen el nombre y ' +
      'el «quién» de la ficha. El contenido no abrió en las comprobaciones hechas desde ' +
      'el repo —queda tras el marco de sesión de claude.ai—, de modo que aquí respalda ' +
      'el equipo y no el propio sitio.',
    principal: {
      tipo: 'pagina',
      etiqueta: 'Ver quién tiene vehículo y quién necesita uno',
      enlace: 'https://claude.ai/code/artifact/a3912c24-7667-4c82-9da5-f94129c18734',
    },
  },
  {
    id: 'conectar-acopio-transporte',
    tema: 'voluntariado',
    nombre: 'Conecta tu acopio, tu vehículo o una zona rural con la ayuda',
    quien: 'Juliana Pachón · Instagram: @pony____________',
    que:
      'Tres formularios de una misma coordinación logística: registrar un centro de ' +
      'acopio y lo que tiene para donar, ofrecer un vehículo con espacio en su ruta, o ' +
      'reportar una zona rural con necesidades cerca de una vía principal. Con eso cruzan ' +
      'acopios, transportes y destinos para que las donaciones lleguen, también a zonas ' +
      'de difícil acceso.',
    zona: 'Valle del Cauca, Chocó, Eje Cafetero, Cauca y Cundinamarca',
    revisado: '2026-08-15',
    comprobacion:
      'Los tres formularios los firma Juliana Pachón Neira, con un WhatsApp de contacto, ' +
      'y el equipo los identifica con la cuenta de Instagram @pony____________. Abiertos ' +
      'el 15-ago: «Centros de Acopio», «Transportes y transportistas» y «Rutas y Zonas ' +
      'Rurales», los tres activos. Es la coordinación de una persona, no de una entidad; ' +
      'la identidad la sostienen su nombre y su Instagram.',
    principal: {
      tipo: 'formulario',
      etiqueta: 'Registrar un centro de acopio',
      enlace:
        'https://docs.google.com/forms/d/e/1FAIpQLSegssXhTQVdvTCwThg9QwlawIywdkjNaGRGbpASH_ozsyTbpw/viewform',
    },
    otros: [
      {
        tipo: 'formulario',
        etiqueta: 'Ofrecer un vehículo para transportar',
        enlace:
          'https://docs.google.com/forms/d/e/1FAIpQLSeEdJ9RBik61tIz0_BfWGgYczj3omgSi1LK1AliZC0jLugRrw/viewform',
      },
      {
        tipo: 'formulario',
        etiqueta: 'Reportar una zona rural en una ruta',
        enlace:
          'https://docs.google.com/forms/d/e/1FAIpQLSeRh4BrCWUv2ZNC1EZjW4ab_LLkXYTs5VoMemPWrwX9ogsrpQ/viewform',
      },
    ],
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
  /*
    Única ficha del directorio cuya comprobación NO es del sitio sino del
    equipo: la página no llega a cargar en las visitas automáticas desde este
    repo. Va porque el equipo confirmó qué es.

    Ojo con el efecto secundario: el canal muestra el dominio de destino, y
    aquí ese dominio es `smartlink2.metricool.com`, que no dice «Cruz Roja» por
    ningún lado. El nombre y el «quién» de la ficha son los que sostienen la
    identidad. Si la seccional llega a publicar el mismo índice en un dominio
    propio, se cambia por ese: se lee mejor y se comprueba solo.
  */
  {
    id: 'cruz-roja-bogota-canales',
    tema: 'voluntariado',
    nombre: 'Todos los canales de la Cruz Roja en Bogotá',
    quien: 'Cruz Roja Colombiana, Seccional Cundinamarca y Bogotá',
    que: 'Índice de los canales oficiales de la seccional.',
    zona: 'Bogotá y Cundinamarca',
    revisado: '2026-08-14',
    comprobacion:
      'Confirmada por el equipo el 14-ago como el índice de canales oficiales de la ' +
      'seccional. Queda anotado que la página no cargó en las comprobaciones hechas ' +
      'desde el repo —se queda en «Loading»—, así que aquí respalda el equipo y no el ' +
      'propio sitio.',
    principal: {
      tipo: 'pagina',
      enlace: 'https://smartlink2.metricool.com/public/smartlink/cruzrojabogota',
    },
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
  {
    id: 'presentes-colombia-se-levanta',
    tema: 'donaciones',
    nombre: 'Colombia se Levanta: agua para comunidades damnificadas',
    quien: 'Corporación Presentes · campaña impulsada por @WestCol',
    que:
      'Campaña «Colombia se Levanta» para abastecer de agua a comunidades damnificadas; ' +
      'aportas un monto único en línea, desde $10.000.',
    revisado: '2026-08-15',
    comprobacion:
      'Abierta el 15-ago: página de donación de la campaña «Colombia se Levanta» para ' +
      'abastecimiento de agua. La opera Corporación Presentes, identificada al pie con ' +
      'dirección en Medellín (Calle 16b sur #41-16), teléfonos, correo ' +
      'comunicaciones@presentes.co, política de privacidad y PQRSF. El equipo confirma ' +
      'la campaña como fuente confiable para donar, impulsada por @WestCol.',
    principal: {
      tipo: 'pagina',
      enlace:
        'https://presentes.co/abastecimiento-de-agua-en-comunidades-damnificadas/donacion/colombiaselevanta',
    },
  },

  /* ─────────────────────────────────────────── quién documenta ── */
  {
    id: 'natha-por-los-animales',
    tema: 'documenta',
    nombre: '@nathaporlosanimales',
    quien: 'Dr. Nathalia Villada-Veterinaria',
    que:
      'Cuenta que se ha vuelto un canal para seguir, al día, lo que va pasando con la ' +
      'emergencia, y qué se necesita.',
    revisado: '2026-08-15',
    comprobacion:
      'Confirmada por el equipo el 15-ago: la cuenta de Dr. Nathalia Villada ' +
      '(@nathaporlosanimales) ya funciona como canal público sobre el terremoto y los ' +
      'incendios, y el equipo decidió incluirla. Es una cuenta personal, no de una ' +
      'entidad; entra por la excepción de §5 para figuras que ya operan como canal ' +
      'público, con el equipo respondiendo por la inclusión.',
    principal: { tipo: 'instagram', cuenta: 'nathaporlosanimales' },
  },
  {
    id: 'andrea-rico',
    tema: 'documenta',
    nombre: '@andrearico_24',
    quien: 'Cuenta de Instagram',
    que:
      'Voluntaria en el Chocó que publica reels de forma constante sobre cómo va la ' +
      'situación con la emergencia, las ayudas que llegan y lo que se va necesitando.',
    zona: 'Chocó',
    revisado: '2026-08-15',
    comprobacion:
      'Aportada por el equipo el 15-ago como cuenta de una voluntaria en el Chocó que ' +
      'documenta la emergencia en reels. Es una cuenta personal, no una entidad; entra ' +
      'por decisión del equipo (excepción de §5 para personas que ya operan como canal ' +
      'público).',
    principal: { tipo: 'instagram', cuenta: 'andrearico_24' },
  },
  {
    id: 'rossy-lemos',
    tema: 'documenta',
    nombre: 'Rossy Lemos',
    quien: 'Cuenta de Instagram · periodista y presentadora',
    que:
      'Presentadora reconocida que documenta, caso por caso, a las personas afectadas ' +
      'en el Chocó y las formas de ayudar —centros de acopio, voluntarios—, y las ' +
      'difunde en sus historias y reels.',
    zona: 'Chocó',
    revisado: '2026-08-15',
    comprobacion:
      'Aportada por el equipo el 15-ago: presentadora y periodista reconocida que ' +
      'documenta la situación en el Chocó y difunde formas de ayudar. Es una figura ' +
      'pública que ya opera como canal; entra por decisión del equipo (excepción de §5 ' +
      'para personas que ya operan como canal público).',
    principal: { tipo: 'instagram', cuenta: 'rossylemos' },
  },
  {
    id: 'valentina-herrada',
    tema: 'documenta',
    nombre: 'Valentina Herrada',
    quien: 'Cuenta de Instagram',
    que:
      'Persona voluntaria en Cali que documenta cómo va la situación con la emergencia, ' +
      'las donaciones y demás temas.',
    zona: 'Cali, Valle del Cauca',
    revisado: '2026-08-15',
    comprobacion:
      'Aportada por el equipo el 15-ago como cuenta de una persona voluntaria en Cali ' +
      'que documenta la emergencia en terreno, junto a las demás cuentas de voluntarios. ' +
      'Es una cuenta personal, no una entidad; entra por decisión del equipo (excepción ' +
      'de §5 para personas que ya operan como canal público).',
    principal: { tipo: 'instagram', cuenta: 'hisoyvalh' },
  },
  {
    id: 'guayaquiliando',
    tema: 'documenta',
    nombre: 'Guayaquiliando',
    quien: 'Cuenta de Instagram',
    que:
      'Cuenta que documenta desde Pereira cómo va la situación con la emergencia, las ' +
      'donaciones y demás temas.',
    zona: 'Pereira, Risaralda',
    revisado: '2026-08-15',
    comprobacion:
      'Aportada por el equipo el 15-ago como cuenta que documenta la emergencia en ' +
      'terreno desde Pereira, junto a las demás cuentas de voluntarios. Es una cuenta ' +
      'personal, no una entidad; entra por decisión del equipo (excepción de §5 para ' +
      'personas que ya operan como canal público).',
    principal: { tipo: 'instagram', cuenta: 'guayaquiliando' },
  },
  {
    id: 'katherine-duque',
    tema: 'documenta',
    nombre: 'Katherine Duque',
    quien: 'Cuenta de Instagram',
    que:
      'Persona voluntaria en Buenaventura que documenta cómo va la situación con la ' +
      'emergencia, las donaciones y demás temas.',
    zona: 'Buenaventura, Valle del Cauca',
    revisado: '2026-08-15',
    comprobacion:
      'Aportada por el equipo el 15-ago como cuenta de una persona voluntaria en ' +
      'Buenaventura que documenta la emergencia en terreno, junto a las demás cuentas de ' +
      'voluntarios. Es una cuenta personal, no una entidad; entra por decisión del ' +
      'equipo (excepción de §5 para personas que ya operan como canal público).',
    principal: { tipo: 'instagram', cuenta: 'katheduque_' },
  },
  {
    id: 'cesar-martinez',
    tema: 'documenta',
    nombre: 'Cesar Martinez',
    quien: 'Cuenta de Instagram',
    que:
      'Persona voluntaria en Manizales que documenta cómo va la situación con la ' +
      'emergencia, las donaciones y demás temas.',
    zona: 'Manizales, Caldas',
    revisado: '2026-08-15',
    comprobacion:
      'Aportada por el equipo el 15-ago como cuenta de una persona voluntaria en ' +
      'Manizales que documenta la emergencia en terreno, junto a las demás cuentas de ' +
      'voluntarios. Es una cuenta personal, no una entidad; entra por decisión del ' +
      'equipo (excepción de §5 para personas que ya operan como canal público).',
    principal: { tipo: 'instagram', cuenta: 'descubriendosaborescol' },
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
  {
    id: 'sos-pereira',
    tema: 'ayuda',
    nombre: 'Portal ciudadano SOS Pereira',
    quien: 'No identificado',
    que:
      'Portal para Pereira donde puedes reportar una persona desaparecida y consultar ' +
      'la lista pública, reportar edificaciones dañadas y sumarte al censo de ' +
      'empresarios afectados.',
    zona: 'Pereira, Risaralda',
    revisado: '2026-08-15',
    comprobacion:
      'Abierta el 15-ago: portal ciudadano de Pereira con formularios para reportar ' +
      'desaparecidos, edificaciones y un censo de empresarios, y una lista pública de ' +
      'desaparecidos. La página no declara responsable, contacto ni política de datos, ' +
      'así que quien la opera queda como No identificado. El equipo indica que la ' +
      'plataforma apareció en las noticias. Entra en Links de ayuda —no en Info ' +
      'oficial— porque no se declara ni se comprobó como entidad oficial.',
    principal: { tipo: 'pagina', enlace: 'https://sospereira.com/' },
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
