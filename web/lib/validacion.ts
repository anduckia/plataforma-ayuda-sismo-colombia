/**
 * Validación de entrada de la cara pública.
 *
 * LÍMITE IMPORTANTE, y conviene tenerlo presente: `POST /api/v5/posts` acepta
 * publicaciones anónimas sin token, así que cualquiera puede saltarse este
 * formulario con curl. Nada de lo que hay aquí es un control de seguridad.
 * Esto ayuda a quien quiere hacer las cosas bien: atrapa errores, no mentiras.
 * Contra la mentira deliberada están la etiqueta «Sin verificar», la cola de
 * verificación del equipo (RF-05) y el archivado con rastro.
 *
 * Y el otro lado de la balanza (P1): cada validación es fricción para alguien
 * asustado. Por eso casi todo avisa en vez de bloquear. Solo se bloquea lo que
 * hace la solicitud inservible para quien tiene que ir a ayudar.
 */

export interface Punto { lat: number; lon: number }

export interface Hallazgo {
  campo?: string;
  texto: string;
  /** `bloquea` impide publicar; `avisa` deja seguir tras confirmar. */
  nivel: 'bloquea' | 'avisa';
}

/** Colombia continental más San Andrés y Providencia. */
const COLOMBIA = { latMin: -4.3, latMax: 13.6, lonMin: -82.0, lonMax: -66.8 };

/** Chocó, Valle del Cauca, Risaralda, Quindío y Caldas, con margen generoso. */
const ZONA_AFECTADA = { latMin: 2.7, latMax: 9.0, lonMin: -78.2, lonMax: -74.6 };

const dentro = (p: Punto, c: typeof COLOMBIA) =>
  p.lat >= c.latMin && p.lat <= c.latMax && p.lon >= c.lonMin && p.lon <= c.lonMax;

export function revisarPunto(p: Punto | null | undefined): Hallazgo[] {
  if (!p) return [];
  if (!Number.isFinite(p.lat) || !Number.isFinite(p.lon)) {
    return [{ texto: 'El punto del mapa no es válido. Vuelve a marcarlo.', nivel: 'bloquea' }];
  }
  if (!dentro(p, COLOMBIA)) {
    return [{
      texto: 'Ese punto está fuera de Colombia. Márcalo de nuevo: sin una ubicación real ' +
             'nadie puede llegar hasta allí.',
      nivel: 'bloquea',
    }];
  }
  if (!dentro(p, ZONA_AFECTADA)) {
    return [{
      texto: 'El punto queda fuera de Chocó, Valle, Risaralda, Quindío y Caldas. Si es ' +
             'correcto, publica igual; si no, vuelve a marcarlo.',
      nivel: 'avisa',
    }];
  }
  return [];
}

/*
 * Teléfonos de Colombia: móviles de 10 dígitos que empiezan por 3, fijos del
 * nuevo formato de 10 que empiezan por 60, y fijos antiguos de 7. Se admite el
 * prefijo +57. Solo avisa: si el número está mal el equipo no puede llamar, que
 * es justamente para lo que existe el campo.
 */
export function revisarTelefono(valor: string, campo: string): Hallazgo[] {
  const crudo = (valor ?? '').trim();
  if (!crudo) return [];
  let d = crudo.replace(/\D/g, '');
  if (d.startsWith('57') && d.length > 10) d = d.slice(2);
  const valido = /^3\d{9}$/.test(d) || /^60\d{8}$/.test(d) || /^\d{7}$/.test(d);
  return valido ? [] : [{
    campo,
    texto: `«${crudo}» no parece un teléfono de Colombia. Revísalo: si está mal, el equipo ` +
           'no podrá llamarte.',
    nivel: 'avisa',
  }];
}

export function revisarCantidad(valor: unknown, campo: string): Hallazgo[] {
  if (valor === '' || valor === null || valor === undefined) return [];
  const n = Number(valor);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
    return [{ campo, texto: 'Escribe cuántas personas son, con un número de 1 en adelante.',
              nivel: 'bloquea' }];
  }
  if (n > 2000) {
    return [{ campo, texto: `¿Seguro que son ${n} personas? Si es un municipio entero, ` +
                            'publícalo igual y dilo en la descripción.', nivel: 'avisa' }];
  }
  return [];
}

/*
 * Datos de contacto escritos en un campo PÚBLICO. Es el patrón de estafa número
 * uno tras un desastre: alguien copia el teléfono publicado y llama pidiendo
 * dinero a cambio de un rescate que nunca llega.
 */
const SIETE_DIGITOS = /\d[\d\s.\-]{6,}/;

export function revisarDatosEnPublico(valor: string, campo: string): Hallazgo[] {
  const t = (valor ?? '').trim();
  if (!t || !SIETE_DIGITOS.test(t)) return [];
  return [{
    campo,
    texto: `Parece que escribiste un número largo en «${campo}», que es público y lo ve ` +
           'cualquiera. Si es tu teléfono, bórralo de ahí y ponlo en el campo con candado: ' +
           'ese solo lo ve el equipo.',
    nivel: 'avisa',
  }];
}

const PALABRAS_DINERO = [
  'cuenta', 'nequi', 'daviplata', 'bancolombia', 'davivienda', 'ahorros',
  'consignar', 'consignación', 'transferir', 'transferencia', 'giro',
];

export function revisarDinero(valor: string, campo: string): Hallazgo[] {
  const t = (valor ?? '').toLowerCase();
  if (!t) return [];
  const hallada = PALABRAS_DINERO.find((p) => t.includes(p));
  if (!hallada || !/\d/.test(t)) return [];
  return [{
    campo,
    texto: 'No publiques números de cuenta ni datos bancarios. Esta plataforma nunca pide ' +
           'dinero, y publicarlos te expone a que te estafen.',
    nivel: 'avisa',
  }];
}

export function revisarTitulo(titulo: string): Hallazgo[] {
  const t = (titulo ?? '').trim();
  if (t.length < 5) {
    return [{ texto: 'Escribe en una frase qué está pasando, para que quien lea sepa a qué va.',
              nivel: 'bloquea' }];
  }
  // Teclado aporreado: una sola letra repetida, o sin vocales en algo largo.
  if (/^(.)\1+$/.test(t.replace(/\s/g, '')) || (t.length > 8 && !/[aeiouáéíóú]/i.test(t))) {
    return [{ texto: 'El primer campo no se entiende. Escribe con palabras qué necesitas.',
              nivel: 'bloquea' }];
  }
  return [];
}

/* ------------------------------------------------------------------ ráfagas */

const CLAVE_RAFAGA = 'sos:publicaciones';
const MAX_POR_VENTANA = 3;
const VENTANA_MS = 10 * 60 * 1000;

/** Frena el dedo nervioso que publica quince veces. No frena a un atacante. */
export function revisarRafaga(ahora = Date.now()): Hallazgo[] {
  if (typeof localStorage === 'undefined') return [];
  let previas: number[] = [];
  try {
    previas = JSON.parse(localStorage.getItem(CLAVE_RAFAGA) ?? '[]');
  } catch { previas = []; }
  const recientes = previas.filter((t) => ahora - t < VENTANA_MS);
  if (recientes.length < MAX_POR_VENTANA) return [];
  return [{
    texto: `Ya publicaste ${recientes.length} solicitudes en los últimos minutos. Si son casos ` +
           'distintos, espera unos minutos y sigue; si es la misma, ya está publicada.',
    nivel: 'avisa',
  }];
}

export function registrarPublicacion(ahora = Date.now()): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const previas: number[] = JSON.parse(localStorage.getItem(CLAVE_RAFAGA) ?? '[]');
    const recientes = previas.filter((t) => ahora - t < VENTANA_MS);
    localStorage.setItem(CLAVE_RAFAGA, JSON.stringify([...recientes, ahora]));
  } catch { /* si el navegador no deja guardar, no pasa nada */ }
}

/* ---------------------------------------------------------------- distancia */

/** Metros entre dos puntos (Haversine). Sirve para detectar duplicados. */
export function metrosEntre(a: Punto, b: Punto): number {
  const R = 6371000;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Radio y ventana para considerar que dos solicitudes pueden ser la misma. */
export const RADIO_DUPLICADO_M = 600;
export const VENTANA_DUPLICADO_H = 24;
