/**
 * El directorio: temas, canales y validación (RF-32, RF-33, ADR-026).
 *
 * Este archivo define la FORMA de una fuente, no su contenido. El contenido
 * vive en `fuentes-datos.ts` mientras se carga a mano, y más adelante llegará
 * desde la hoja de cálculo (T-061) con esta misma forma.
 */

/* ─────────────────────────────────────────────────────────────── temas ── */

/**
 * Las seis secciones, en el orden en que se pintan.
 *
 * El orden lo fija el equipo y responde a lo que la gente está buscando de
 * verdad estos días: dónde está la ayuda primero, entender qué pasó al final.
 * Poner las manos y poner plata son cosas distintas y van separadas, porque
 * quien puede ir a cargar bultos no es quien puede transferir.
 *
 * `corto` es la etiqueta del índice: en una rejilla de dos columnas a 375 px,
 * cualquier nombre de más de dos palabras ya ocupa tres renglones.
 */
export const TEMAS = [
  {
    id: 'mapas',
    nombre: 'Mapas en tiempo real',
    corto: 'Mapas',
  },
  {
    id: 'voluntariado',
    nombre: 'Voluntariado y centros de acopio',
    corto: 'Voluntariado',
  },
  { id: 'donaciones', nombre: 'Donaciones', corto: 'Donaciones' },
  {
    id: 'documenta',
    nombre: 'Quién está documentando la emergencia',
    corto: 'Quién documenta',
  },
  { id: 'ayuda', nombre: 'Links de ayuda', corto: 'Links de ayuda' },
  { id: 'vias', nombre: 'Vías, transporte y acceso', corto: 'Vías y transporte' },
  { id: 'oficial', nombre: 'Información oficial y qué pasó', corto: 'Info oficial' },
] as const;

export type TemaId = (typeof TEMAS)[number]['id'];

const IDS_TEMA = new Set<string>(TEMAS.map((t) => t.id));

/* ──────────────────────────────────────────────────────────── canales ── */

/**
 * Las cuentas se guardan como usuario, no como URL: escribir `@alguien` es lo
 * que hace que cargar una fuente desde una hoja de cálculo sea sostenible, y
 * de paso permite mostrar `@alguien` en vez de una URL de sesenta caracteres.
 * Añadir una plataforma nueva es una línea aquí.
 */
const PLATAFORMAS = {
  instagram: { nombre: 'Instagram', url: (u: string) => `https://instagram.com/${u}` },
  facebook: { nombre: 'Facebook', url: (u: string) => `https://facebook.com/${u}` },
  x: { nombre: 'X', url: (u: string) => `https://x.com/${u}` },
  tiktok: { nombre: 'TikTok', url: (u: string) => `https://tiktok.com/@${u}` },
} as const;

export type TipoCuenta = keyof typeof PLATAFORMAS;

/** Tipos que apuntan a una URL cualquiera. */
const CON_ENLACE = {
  pagina: 'Página',
  mapa: 'Mapa',
  formulario: 'Formulario',
  documento: 'Documento o boletín',
  whatsapp: 'Grupo de WhatsApp',
} as const;

export type TipoEnlace = keyof typeof CON_ENLACE;

/**
 * Unión discriminada a propósito: un canal de Instagram sin usuario, o una
 * línea telefónica con URL, no se pueden ni escribir. Lo que el tipo puede
 * impedir no hace falta validarlo después.
 */
export type Canal =
  | { tipo: TipoCuenta; cuenta: string }
  | { tipo: TipoEnlace; enlace: string; etiqueta?: string }
  | { tipo: 'telefono'; numero: string };

export type Tipo = Canal['tipo'];

/** Cómo se llama cada tipo en la píldora de la ficha. */
export function nombreDelTipo(tipo: Tipo): string {
  if (tipo === 'telefono') return 'Línea telefónica';
  if (tipo in PLATAFORMAS) return PLATAFORMAS[tipo as TipoCuenta].nombre;
  return CON_ENLACE[tipo as TipoEnlace];
}

const esCuenta = (c: Canal): c is { tipo: TipoCuenta; cuenta: string } =>
  c.tipo in PLATAFORMAS;

/** Quita la arroba y, si alguien pegó la URL entera, se queda con el usuario. */
export function normalizarCuenta(bruto: string): string {
  const limpio = bruto.trim().replace(/\/+$/, '');
  const desdeUrl = limpio.match(/^https?:\/\/[^/]+\/@?([^/?#]+)/i);
  return (desdeUrl ? desdeUrl[1] : limpio).replace(/^@/, '');
}

/**
 * A dónde va el canal y qué se lee en él.
 *
 * `texto` es SIEMPRE el destino —el dominio o el usuario—, nunca «ver más».
 * Con la suplantación siendo rutinaria después de un desastre, saber a dónde
 * vas antes de tocar es la mitad del trabajo de la ficha.
 */
export function destinoDe(canal: Canal): { href: string; texto: string } {
  if (esCuenta(canal)) {
    const usuario = normalizarCuenta(canal.cuenta);
    const { nombre, url } = PLATAFORMAS[canal.tipo];
    return { href: url(usuario), texto: `@${usuario} en ${nombre}` };
  }

  if (canal.tipo === 'telefono') {
    return { href: `tel:${canal.numero.replace(/[^\d+]/g, '')}`, texto: canal.numero };
  }

  if (canal.tipo === 'whatsapp') {
    // El enlace de invitación no dice nada («chat.whatsapp.com/K3f9…»), así que
    // el texto describe qué es. La píldora de tipo ya avisa que se entra a un
    // grupo.
    return { href: canal.enlace, texto: 'Grupo abierto en WhatsApp' };
  }

  // Mismo caso que WhatsApp: cuando varios enlaces caen en el mismo dominio
  // —tres Google Forms en `docs.google.com`, dos Google Docs— el dominio no
  // distingue cuál es cuál. `etiqueta` dice para qué sirve ESE enlace; describe
  // el propósito del formulario, no quién está detrás (eso sigue en `quien`).
  if (canal.etiqueta?.trim()) {
    return { href: canal.enlace, texto: canal.etiqueta.trim() };
  }

  let dominio = canal.enlace;
  try {
    dominio = new URL(canal.enlace).hostname.replace(/^www\./, '');
  } catch {
    /* La validación ya lo marcó; aquí no se rompe la página por eso. */
  }
  return { href: canal.enlace, texto: dominio };
}

/* ─────────────────────────────────────────────────────────────── ficha ── */

export interface Fuente {
  /** Slug estable. Es el ancla de la ficha y no debería cambiar nunca. */
  id: string;
  tema: TemaId;
  nombre: string;
  /** Institución, colectivo, persona, o «No identificado». */
  quien: string;
  /** Qué encuentras ahí, en una frase concreta. */
  que: string;
  /** Solo si se sabe con certeza. Vacío es mejor que inventado. */
  zona?: string;
  /** AAAA-MM-DD. Sin esto no se publica (RF-34). */
  revisado: string;
  /**
   * Cómo se comprobó que la fuente es quien dice ser. NUNCA se pinta.
   *
   * Es obligatorio para que la regla contra la suplantación sea un paso del
   * trabajo y no una buena intención: no se puede cargar una cuenta sin
   * escribir cómo se comprobó.
   */
  comprobacion: string;
  /** Da la etiqueta de tipo de la ficha. */
  principal: Canal;
  /** Hasta dos. La fecha de revisión cubre TODOS los canales de la ficha. */
  otros?: Canal[];
}

/** Nota de lo que se buscó y no se encontró, al final de una sección (RF-35). */
export interface Vacio {
  tema: TemaId;
  texto: string;
  /** Segunda frase opcional; suele ser la invitación a aportarla. */
  cola?: string;
}

/* ────────────────────────────────────────────────────────── validación ── */

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

function problemaDeCanal(c: Canal, donde: string): string | null {
  if (esCuenta(c)) {
    return normalizarCuenta(c.cuenta) ? null : `${donde}: falta el usuario`;
  }
  if (c.tipo === 'telefono') {
    return c.numero.trim() ? null : `${donde}: falta el número`;
  }
  if (!c.enlace?.trim()) return `${donde}: falta el enlace`;
  try {
    const { protocol } = new URL(c.enlace);
    if (protocol !== 'http:' && protocol !== 'https:') {
      return `${donde}: el enlace no es http ni https`;
    }
  } catch {
    return `${donde}: el enlace está mal formado`;
  }
  return null;
}

/**
 * Qué le falta a una fuente para poder publicarse. Vacío = está bien.
 *
 * No comprueba que el enlace esté vivo: eso es una petición de red y no se
 * hace mientras se pinta una página. Va en `npm run revisar-fuentes`.
 */
export function problemasDe(f: Fuente, hoy: string): string[] {
  const p: string[] = [];

  if (!f.id?.trim()) p.push('falta el identificador');
  if (!IDS_TEMA.has(f.tema)) p.push(`el tema «${f.tema}» no existe`);
  if (!f.nombre?.trim()) p.push('falta el nombre');
  if (!f.quien?.trim()) p.push('falta quién la hace');
  if (!f.que?.trim()) p.push('falta qué encuentras ahí');

  if (!FECHA.test(f.revisado ?? '')) {
    p.push('la fecha de revisión falta o no tiene forma AAAA-MM-DD');
  } else if (f.revisado > hoy) {
    p.push('la fecha de revisión está en el futuro');
  }

  // Sin esto no se puede afirmar que la cuenta es quien dice ser.
  if (!f.comprobacion?.trim()) p.push('falta la comprobación de identidad');

  const malPrincipal = problemaDeCanal(f.principal, 'canal principal');
  if (malPrincipal) p.push(malPrincipal);

  const otros = f.otros ?? [];
  if (otros.length > 2) {
    p.push(`tiene ${otros.length} canales secundarios y el máximo es 2`);
  }
  otros.forEach((c, i) => {
    const mal = problemaDeCanal(c, `canal secundario ${i + 1}`);
    if (mal) p.push(mal);
  });

  return p;
}

export interface Revision {
  validas: Fuente[];
  /** Las que no pasaron, con el motivo. Se registran, no se pintan. */
  descartadas: { fuente: Fuente; problemas: string[] }[];
}

/**
 * Separa lo publicable de lo que no. **Falla cerrado por ficha:** una fila mala
 * no se pinta y el resto de la página sí. Una fuente sin fecha o sin
 * comprobación se cae sola; es preferible una sección más corta que una ficha
 * que no podemos sostener.
 */
export function revisar(todas: Fuente[], hoy: string): Revision {
  const validas: Fuente[] = [];
  const descartadas: Revision['descartadas'] = [];
  const vistos = new Set<string>();

  for (const fuente of todas) {
    const problemas = problemasDe(fuente, hoy);
    if (vistos.has(fuente.id)) problemas.push(`el identificador «${fuente.id}» está repetido`);

    if (problemas.length) descartadas.push({ fuente, problemas });
    else {
      vistos.add(fuente.id);
      validas.push(fuente);
    }
  }

  return { validas, descartadas };
}

/** Orden canónico de los canales secundarios, no el de carga (RF-33). */
const ORDEN: Tipo[] = [
  'pagina', 'mapa', 'documento', 'formulario',
  'instagram', 'facebook', 'x', 'tiktok',
  'whatsapp', 'telefono',
];

export const ordenarCanales = (canales: Canal[]): Canal[] =>
  [...canales].sort((a, b) => ORDEN.indexOf(a.tipo) - ORDEN.indexOf(b.tipo));
