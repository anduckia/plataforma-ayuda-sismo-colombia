/**
 * Cliente de la API v5 de Ushahidi para la cara pública.
 *
 * Todo lo que hay aquí funciona SIN autenticación: publicar es anónimo a
 * propósito (nadie debería crear una cuenta para pedir rescate). La API se
 * encarga de no devolver los campos protegidos a quien no tiene permiso, así
 * que este front nunca ve el teléfono ni la dirección exacta de nadie.
 */

import {
  metrosEntre, RADIO_DUPLICADO_M, VENTANA_DUPLICADO_H, type Punto,
} from './validacion';

export const API =
  process.env.NEXT_PUBLIC_USHAHIDI_API ?? 'https://sos-sismo-colombia.api.ushahidi.io';

export interface Campo {
  id: number;
  key: string;
  label: string;
  instructions: string | null;
  input: string;
  type: string;
  required: boolean;
  default: string | null;
  priority: number;
  options: any[] | null;
  response_private: boolean;
}

export interface Encuesta {
  id: number;
  name: string;
  description: string;
  tareaId: number;
  campos: Campo[];
}

/**
 * Los cuatro formularios, con URLs que se pueden dictar por radio (RF-15).
 *
 * `meta` es la descripción propia de cada página: compartir las cuatro URLs con
 * el mismo resumen hacía que en WhatsApp todas se vieran como «Pido ayuda».
 * `pie` es lo que se promete bajo el botón, y cambia según dónde acaban los
 * datos: en «Pido ayuda» la publicación es el objetivo; en los dos formularios
 * de contacto, prometer visibilidad inmediata sería mentir (P5).
 */
export const FORMULARIOS = {
  'pido-ayuda': {
    nombreApi: 'Pido ayuda',
    titulo: 'Pido ayuda',
    gancho: 'Para que la ayuda te encuentre',
    descripcion: 'Rescate, salud, comida, agua, refugio o transporte.',
    tono: 'auxilio',
    meta: 'Publica qué necesitas y dónde estás para que los equipos de ayuda te ' +
      'encuentren. Tu teléfono y tu dirección exacta nunca son públicos. Sin cuenta y gratis.',
    pie: 'Se publica de inmediato, marcado como «sin verificar» hasta que el equipo lo confirme.',
  },
  'busco-familiar': {
    nombreApi: 'Busco a un familiar',
    titulo: 'Busco a un familiar',
    gancho: 'Para que más ojos lo busquen',
    descripcion: 'Publica los datos de la persona que no aparece.',
    tono: 'busqueda',
    meta: 'Publica los datos de la persona que no aparece para que más ojos la busquen. ' +
      'Tu teléfono no se publica. Registra el caso también en la Cruz Roja Colombiana.',
    pie: 'Se publica de inmediato, marcado como «sin verificar» hasta que el equipo lo confirme.',
  },
  'quiero-ayudar': {
    nombreApi: 'Quiero ayudar',
    titulo: 'Quiero ayudar',
    gancho: 'Para entrar al equipo verificado',
    descripcion: 'Regístrate como voluntario u organización.',
    tono: 'apoyo',
    meta: 'Regístrate como voluntario u organización. El equipo te llama para verificarte ' +
      'y luego te da acceso a los datos de contacto de quienes piden ayuda.',
    pie: 'Tus datos solo los ve el equipo; te llamaremos para verificarte.',
  },
  'ofrezco-recursos': {
    nombreApi: 'Ofrezco recursos',
    titulo: 'Ofrezco recursos',
    gancho: 'Para cruzar tu recurso con quien lo necesita',
    descripcion: 'Maquinaria, plantas eléctricas, luces, herramienta o transporte.',
    tono: 'recurso',
    meta: 'Registra maquinaria, plantas eléctricas, iluminación, herramienta o transporte ' +
      'para que el equipo los cruce con quien los necesita. Tu teléfono no se publica.',
    pie: 'Tus datos de contacto solo los ve el equipo; te llamaremos para coordinar la asignación.',
  },
} as const;

export type Slug = keyof typeof FORMULARIOS;

/**
 * Campos que llena el equipo, no quien publica. Se envían con su valor por
 * defecto para que la cola de verificación siga funcionando, pero jamás se
 * muestran: si «Verificación» apareciera en el formulario, cualquiera podría
 * marcarse a sí mismo como verificado por el equipo.
 */
const DEL_EQUIPO = [
  'Estado de la solicitud', 'Estado de la búsqueda', 'Verificación',
  // ADR-011: lo mueve el equipo al asignar el recurso. Si el oferente pudiera
  // marcarse «Asignado» a sí mismo, el mapa dejaría de servir para despachar.
  'Estado del recurso',
];

export const esDelEquipo = (c: Campo) => DEL_EQUIPO.includes(c.label);

/**
 * Textos que se corrigen sobre la marcha, sin tocar la etiqueta real del campo:
 * el POST tiene que seguir enviando el `label` que la API conoce, y las
 * encuestas ya creadas no se pueden reetiquetar sin borrarlas (con sus
 * publicaciones dentro). La auditoría de `aplicar_config.py` compara etiquetas
 * contra el despliegue vivo, así que el YAML conserva la original y lleva la
 * nota de qué quitar cuando se recree desde cero.
 */
const TEXTOS: Record<string, { etiqueta?: string; ayuda?: string }> = {
  // En esta cara nadie crea cuenta: pedir «el correo con el que creaste tu
  // cuenta» dejaba al voluntario buscando una cuenta que no existe (RF-15).
  'Correo con el que creaste tu cuenta aquí': {
    etiqueta: 'Tu correo',
    ayuda: 'Ahí te enviaremos el acceso cuando te verifiquemos. No necesitas crear ninguna cuenta ahora.',
  },
};

export const etiquetaDe = (c: Campo) => TEXTOS[c.label]?.etiqueta ?? c.label;
export const ayudaDe = (c: Campo) => TEXTOS[c.label]?.ayuda ?? c.instructions;

async function pedir(ruta: string) {
  const r = await fetch(API + ruta, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!r.ok) throw new Error(`La plataforma respondió ${r.status} a ${ruta}`);
  return r.json();
}

export async function traerEncuesta(slug: Slug): Promise<Encuesta> {
  const { nombreApi } = FORMULARIOS[slug];
  const lista = await pedir('/api/v5/surveys');
  const resumen = (lista.results ?? []).find((s: any) => s.name === nombreApi);
  if (!resumen) throw new Error(`No existe la encuesta «${nombreApi}» en el despliegue`);

  const { result } = await pedir(`/api/v5/surveys/${resumen.id}`);
  // La API ya excluye las etapas internas para quien no está autenticado.
  const tarea = result.tasks?.[0];
  if (!tarea) throw new Error(`La encuesta «${nombreApi}» no tiene campos`);

  return {
    id: result.id,
    name: result.name,
    description: result.description,
    tareaId: tarea.id,
    campos: [...tarea.fields].sort((a: Campo, b: Campo) => a.priority - b.priority),
  };
}

export interface Solicitud {
  id: number;
  title: string;
  content: string;
  fecha: string;
  urgencia: string | null;
  estado: string | null;
  verificada: boolean;
  municipio: string | null;
  necesidades: string[];
  punto: { lat: number; lon: number } | null;
}

const valorDe = (campo: any): any => {
  const v = campo?.value;
  if (Array.isArray(v)) return v[0]?.value ?? null;
  if (v && typeof v === 'object' && 'value' in v) return (v as any).value;
  return v ?? null;
};

/** Solicitudes publicadas, ya normalizadas para pintarlas en mapa y lista. */
export async function traerSolicitudes(limite = 200): Promise<Solicitud[]> {
  const datos = await pedir(`/api/v5/posts?limit=${limite}&order=desc&orderby=post_date`);
  return (datos.results ?? []).map((p: any): Solicitud => {
    const campos: any[] = (p.post_content ?? []).flatMap((t: any) => t.fields ?? []);
    const porEtiqueta = (etiqueta: string) => campos.find((f) => f.label === etiqueta);
    const punto = valorDe(porEtiqueta('Ubicación (punto en el mapa)')) ??
      valorDe(porEtiqueta('Último lugar donde se le vio (mapa)'));
    const categorias = porEtiqueta('¿Qué necesitas?')?.value;

    return {
      id: p.id,
      title: p.title ?? 'Sin título',
      content: p.content ?? '',
      fecha: p.post_date ?? p.created,
      urgencia: valorDe(porEtiqueta('Urgencia')),
      estado:
        valorDe(porEtiqueta('Estado de la solicitud')) ??
        valorDe(porEtiqueta('Estado de la búsqueda')),
      verificada: String(valorDe(porEtiqueta('Verificación')) ?? '').includes('Verificada'),
      municipio: valorDe(porEtiqueta('Municipio y departamento')),
      necesidades: Array.isArray(categorias) ? categorias.map((c: any) => c.tag) : [],
      punto: punto && typeof punto === 'object' && 'lat' in punto ? punto : null,
    };
  });
}

/**
 * Solicitudes recientes cerca de un punto: tres familiares reportando a la
 * misma persona atrapada mandan tres equipos al mismo sitio. Se le enseñan a
 * quien publica para que decida, porque es quien sabe si es el mismo caso.
 */
export async function buscarParecidas(punto: Punto): Promise<Solicitud[]> {
  const desde = Date.now() - VENTANA_DUPLICADO_H * 3600 * 1000;
  try {
    const todas = await traerSolicitudes(200);
    return todas
      .filter((s) => {
        if (!s.punto) return false;
        const fecha = new Date(s.fecha).getTime();
        if (Number.isFinite(fecha) && fecha < desde) return false;
        return metrosEntre(punto, s.punto) <= RADIO_DUPLICADO_M;
      })
      .slice(0, 5);
  } catch {
    // Si la búsqueda falla, no se bloquea la publicación: publicar importa más.
    return [];
  }
}

/** Publica. Devuelve el id para poder mostrárselo a la persona. */
export async function publicar(
  encuesta: Encuesta,
  valores: Record<number, any>,
  titulo: string,
  contenido: string,
): Promise<number> {
  const campos = encuesta.campos
    .filter((c) => c.type !== 'title' && c.type !== 'description')
    .map((c) => {
      const valor = esDelEquipo(c) ? c.default : valores[c.id];
      if (valor === undefined || valor === null || valor === '' ||
          (Array.isArray(valor) && valor.length === 0)) {
        return null;
      }
      return { id: c.id, type: c.type, input: c.input, label: c.label, value: { value: valor } };
    })
    .filter(Boolean);

  const r = await fetch(`${API}/api/v5/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      form_id: encuesta.id,
      title: titulo,
      content: contenido || titulo,
      type: 'report',
      completed_stages: [encuesta.tareaId],
      post_content: [{ id: encuesta.tareaId, fields: campos }],
    }),
  });

  if (!r.ok) {
    const detalle = await r.text();
    throw new Error(
      r.status === 422
        ? 'Faltan datos obligatorios o alguno tiene un formato que la plataforma no acepta.'
        : `No se pudo publicar (error ${r.status}). ${detalle.slice(0, 160)}`,
    );
  }
  const { result } = await r.json();
  return result.id;
}
