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
 * `pie` es lo que se promete bajo el botón y `confirmacion` lo que se dice
 * después; ambos cambian según dónde acaban los datos. En las dos encuestas de
 * auxilio la publicación es el objetivo. En las dos de oferta el envío entra
 * como borrador y solo lo ve el equipo (ADR-016): prometer ahí visibilidad
 * inmediata, o mandar a alguien a buscarse en el mapa, sería mentirle (P5).
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
    confirmacion: {
      titulo: 'Publicado. Ya es visible para los equipos de ayuda.',
      palabra: 'solicitud',
      detalle: 'El equipo revisa primero las solicitudes críticas. Si dejaste un teléfono, ' +
        'pueden llamarte para confirmar.',
      verMapa: true,
    },
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
    confirmacion: {
      titulo: 'Publicado. Ya es visible para quien esté buscando.',
      palabra: 'búsqueda',
      detalle: 'Registra el caso también en el programa de Restablecimiento del Contacto ' +
        'entre Familiares de la Cruz Roja Colombiana.',
      verMapa: true,
    },
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
    confirmacion: {
      titulo: 'Recibido. Lo tiene el equipo.',
      palabra: 'registro',
      detalle: 'No aparece en el mapa público ni lo ve nadie más: tu registro queda a la ' +
        'espera de que el equipo te llame para verificarte. Ten el teléfono a mano.',
      verMapa: false,
    },
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
    confirmacion: {
      titulo: 'Recibido. Lo tiene el equipo.',
      palabra: 'recurso',
      detalle: 'No aparece en el mapa público: el equipo lo cruza con las necesidades y te ' +
        'llama para asignarte. Recuerda que la maquinaria solo entra a un punto de rescate ' +
        'cuando un organismo de socorro lo pide.',
      verMapa: false,
    },
  },
} as const;

export type Slug = keyof typeof FORMULARIOS;

/**
 * Lo único que sale al mapa y al listado público (RF-16, ADR-016).
 *
 * El mapa es la herramienta de triaje: mezclar ofertas de maquinaria y
 * registros de voluntarios con personas atrapadas lo vuelve ilegible justo
 * cuando hay que leerlo rápido. Las dos encuestas de oferta van además con
 * aprobación previa en el backend, porque esconderlas solo aquí no serviría
 * de nada: `GET /api/v5/posts` responde sin token a quien lo pida.
 */
export const EN_EL_MAPA = {
  'pido-ayuda': 'auxilio',
  'busco-familiar': 'busqueda',
} as const;

export type Tipo = (typeof EN_EL_MAPA)[keyof typeof EN_EL_MAPA];

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
  tipo: Tipo;
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

/**
 * Qué encuesta es cada `form_id`, resuelto por nombre y no por id fijo: los ids
 * cambian de un despliegue a otro y este front tiene que servir para replicar.
 */
async function encuestasDelMapa(): Promise<Map<number, Tipo>> {
  const lista = await pedir('/api/v5/surveys');
  const porNombre = new Map<string, Tipo>(
    (Object.keys(EN_EL_MAPA) as (keyof typeof EN_EL_MAPA)[])
      .map((slug) => [FORMULARIOS[slug].nombreApi as string, EN_EL_MAPA[slug]]),
  );
  const salida = new Map<number, Tipo>();
  for (const s of lista.results ?? []) {
    const tipo = porNombre.get(s.name);
    if (tipo) salida.set(s.id, tipo);
  }
  return salida;
}

/** Solicitudes publicadas, ya normalizadas para pintarlas en mapa y lista. */
export async function traerSolicitudes(limite = 200): Promise<Solicitud[]> {
  const [tipoPorEncuesta, datos] = await Promise.all([
    encuestasDelMapa(),
    pedir(`/api/v5/posts?limit=${limite}&order=desc&orderby=post_date`),
  ]);

  return (datos.results ?? []).flatMap((p: any): Solicitud[] => {
    // Fuera todo lo que no sea auxilio o búsqueda (RF-16).
    const tipo = tipoPorEncuesta.get(p.form_id);
    if (!tipo) return [];
    const campos: any[] = (p.post_content ?? []).flatMap((t: any) => t.fields ?? []);
    const porEtiqueta = (etiqueta: string) => campos.find((f) => f.label === etiqueta);
    const punto = valorDe(porEtiqueta('Ubicación (punto en el mapa)')) ??
      valorDe(porEtiqueta('Último lugar donde se le vio (mapa)'));
    const categorias = porEtiqueta('¿Qué necesitas?')?.value;

    return [{
      id: p.id,
      tipo,
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
    }];
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
