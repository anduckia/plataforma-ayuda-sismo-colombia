'use client';

import { useMemo, useState } from 'react';
import SelectorUbicacion from './SelectorUbicacion';
import SelectorMunicipio from './SelectorMunicipio';
import {
  publicar, esDelEquipo, buscarParecidas, etiquetaDe, ayudaDe, FORMULARIOS,
  type Campo, type Encuesta, type Slug, type Solicitud,
} from '@/lib/ushahidi';
import {
  revisarPunto, revisarTelefono, revisarCantidad, revisarDatosEnPublico,
  revisarDinero, revisarTitulo, revisarRafaga, registrarPublicacion,
  type Hallazgo, type Punto,
} from '@/lib/validacion';

/** El campo de imagen exige subida multipart aparte; queda fuera de esta versión. */
const soportado = (c: Campo) => c.type !== 'media';

/** Lista cerrada en vez de texto libre (RF-21, ADR-020). */
const CAMPO_MUNICIPIO = 'Municipio y departamento';

/**
 * Los datos que necesita quien va en camino y que ninguna dirección da (RF-22).
 * Van juntos, al final y plegados: son cinco preguntas más en un formulario que
 * llena gente asustada, y sueltas alargarían la página para todo el mundo justo
 * donde más se abandona. Ushahidi no tiene grupos de campos, así que el grupo
 * es cosa de esta cara.
 */
const CAMPOS_ACCESO = [
  'Cómo se llega',
  'Punto de referencia comunitario',
  '¿Hay dónde aterrizar cerca?',
  'Tiempo desde el pueblo más cercano',
  '¿La vía está bloqueada?',
];

const esDeAcceso = (c: Campo) => CAMPOS_ACCESO.includes(c.label);

function Etiqueta({ campo }: { campo: Campo }) {
  const ayuda = ayudaDe(campo);
  return (
    <>
      <label className="campo__etiqueta" htmlFor={`c${campo.id}`}>
        {etiquetaDe(campo)}
        {campo.required && <span className="campo__obligatorio" aria-hidden="true"> *</span>}
        {campo.required && <span className="saltar">(obligatorio)</span>}
      </label>
      {campo.response_private && (
        <span className="campo__candado">🔒 Dato privado — nunca sale en el mapa. Solo lo ven los ayudantes verificados por el equipo para poder llegar hasta ti.</span>
      )}
      {ayuda && <span className="campo__ayuda">{ayuda}</span>}
    </>
  );
}

export default function Formulario({
  encuesta,
  slug,
}: {
  encuesta: Encuesta;
  slug: Slug;
}) {
  const campos = useMemo(
    () => encuesta.campos.filter((c) => !esDelEquipo(c) && soportado(c)),
    [encuesta],
  );

  const [valores, setValores] = useState<Record<number, any>>({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicadoId, setPublicadoId] = useState<number | null>(null);
  const [bloqueos, setBloqueos] = useState<Hallazgo[]>([]);
  const [revision, setRevision] = useState<
    { avisos: Hallazgo[]; parecidas: Solicitud[] } | null
  >(null);

  /**
   * Aplica a cada campo la validación que le corresponde. Casi todo avisa en
   * vez de bloquear: cada obstáculo es fricción para alguien asustado (P1).
   */
  function revisarTodo(titulo: string): Hallazgo[] {
    const hallazgos: Hallazgo[] = [...revisarTitulo(titulo), ...revisarRafaga()];

    for (const c of campos) {
      const v = valores[c.id];
      if (v === undefined || v === null || v === '') continue;

      if (c.input === 'location') {
        hallazgos.push(...revisarPunto(v as Punto));
      } else if (c.input === 'number' && /personas/i.test(c.label)) {
        hallazgos.push(...revisarCantidad(v, c.label));
      } else if (/tel[eé]fono/i.test(c.label)) {
        hallazgos.push(...revisarTelefono(String(v), c.label));
      }

      // Solo en lo que se publica: en los campos con candado el dato está a salvo.
      const esTexto = c.input === 'text' || c.input === 'textarea';
      if (esTexto && !c.response_private && !/tel[eé]fono/i.test(c.label)) {
        hallazgos.push(...revisarDatosEnPublico(String(v), c.label));
        hallazgos.push(...revisarDinero(String(v), c.label));
      }
    }
    return hallazgos;
  }

  const poner = (id: number, v: any) => setValores((prev) => ({ ...prev, [id]: v }));

  const alternar = (id: number, opcion: any) => {
    const actual: any[] = valores[id] ?? [];
    poner(id, actual.includes(opcion) ? actual.filter((x) => x !== opcion) : [...actual, opcion]);
  };

  async function publicarYa(titulo: string, descripcion: string) {
    setEnviando(true);
    try {
      const id = await publicar(encuesta, valores, titulo, descripcion);
      registrarPublicacion();
      setPublicadoId(id);
      window.scrollTo({ top: 0 });
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo publicar. Revisa tu conexión e inténtalo otra vez.');
      setRevision(null);
    } finally {
      setEnviando(false);
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBloqueos([]);

    const campoTitulo = encuesta.campos.find((c) => c.type === 'title');
    const campoDesc = encuesta.campos.find((c) => c.type === 'description');
    const titulo = String(valores[campoTitulo?.id ?? -1] ?? '').trim();
    const descripcion = String(valores[campoDesc?.id ?? -1] ?? '').trim();

    // Validación propia: la del navegador no cubre mapa ni casillas.
    const falta = campos.find((c) => {
      if (!c.required) return false;
      const v = valores[c.id];
      return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
    });
    if (falta) {
      setError(`Falta un dato obligatorio: «${etiquetaDe(falta)}».`);
      document.getElementById(`c${falta.id}`)?.scrollIntoView({ block: 'center' });
      return;
    }

    const hallazgos = revisarTodo(titulo);
    const paran = hallazgos.filter((h) => h.nivel === 'bloquea');
    if (paran.length) {
      setBloqueos(paran);
      window.scrollTo({ top: document.body.scrollHeight });
      return;
    }

    const avisos = hallazgos.filter((h) => h.nivel === 'avisa');

    // Duplicados: tres familiares reportando lo mismo mandan tres equipos al
    // mismo sitio. Se buscan solo si hay punto con el que comparar.
    const campoPunto = campos.find((c) => c.input === 'location');
    const punto = campoPunto ? (valores[campoPunto.id] as Punto | undefined) : undefined;

    setEnviando(true);
    const parecidas = punto ? await buscarParecidas(punto) : [];
    setEnviando(false);

    if (avisos.length || parecidas.length) {
      setRevision({ avisos, parecidas });
      window.scrollTo({ top: document.body.scrollHeight });
      return;
    }

    await publicarYa(titulo, descripcion);
  }

  function confirmarYPublicar() {
    const campoTitulo = encuesta.campos.find((c) => c.type === 'title');
    const campoDesc = encuesta.campos.find((c) => c.type === 'description');
    setRevision(null);
    void publicarYa(
      String(valores[campoTitulo?.id ?? -1] ?? '').trim(),
      String(valores[campoDesc?.id ?? -1] ?? '').trim(),
    );
  }

  if (publicadoId !== null) {
    const { titulo, palabra, detalle, verMapa } = FORMULARIOS[slug].confirmacion;
    return (
      <div className="aviso">
        <p className="aviso__titulo">{titulo}</p>
        <p>
          Guarda este número: <strong>{publicadoId}</strong>. Con él puedes pedir
          actualizaciones o el borrado de tu {palabra}.
        </p>
        <p>{detalle}</p>
        {verMapa && (
          <>
            <p style={{ marginTop: '1.25rem', marginBottom: '0.5rem' }}><strong>¿Qué sigue?</strong></p>
            <ol style={{ margin: '0 0 1.25rem', paddingLeft: '1.4rem', lineHeight: 1.6 }}>
              <li><strong>Guarda el número {publicadoId}</strong> — es tu referencia si quieres corregir algo o que lo borremos.</li>
              <li><strong>Ten el teléfono a mano</strong> — si dejaste número, un ayudante verificado puede llamarte para confirmar el caso.</li>
              <li><strong>Si la ayuda llega o el caso se resuelve</strong>, escríbenos a <strong>sossismocolombia@gmail.com</strong> para marcarlo como «Resuelta» y liberar a los rescatistas hacia otros frentes.</li>
            </ol>
            <p style={{ marginTop: '0.5rem' }}>
              <a className="boton boton--secundario" href="/mapa">Ver el mapa de solicitudes</a>
            </p>
          </>
        )}
      </div>
    );
  }

  const normales = campos.filter((c) => !esDeAcceso(c));
  const acceso = campos.filter(esDeAcceso);

  const pintar = (campo: Campo) => {
    const v = valores[campo.id];

    if (campo.label === CAMPO_MUNICIPIO) {
      return (
        <div className="campo" key={campo.id}>
          <Etiqueta campo={campo} />
          <SelectorMunicipio
            valor={String(v ?? '')}
            alCambiar={(s) => poner(campo.id, s)}
            idCampo={`c${campo.id}`}
          />
        </div>
      );
    }

    if (campo.input === 'location') {
      return (
        <div className="campo" key={campo.id} id={`c${campo.id}`}>
          <Etiqueta campo={campo} />
          <SelectorUbicacion
            valor={(v as Punto) ?? null}
            alCambiar={(p) => poner(campo.id, p)}
          />
        </div>
      );
    }

    if (campo.input === 'radio') {
      const opciones: string[] = (campo.options as string[]) ?? [];
      const esUrgencia = campo.label === 'Urgencia';
      return (
        <fieldset className="campo" key={campo.id} id={`c${campo.id}`}
                  style={{ border: 0, padding: 0, margin: '0 0 1.9rem' }}>
          <legend className="campo__etiqueta" style={{ padding: 0 }}>
            {etiquetaDe(campo)}
            {campo.required && <span className="campo__obligatorio" aria-hidden="true"> *</span>}
          </legend>
          {ayudaDe(campo) && <span className="campo__ayuda">{ayudaDe(campo)}</span>}
          <div className={esUrgencia ? 'urgencia' : 'opciones'}>
            {opciones.map((o) => (
              <label key={o} className={`opcion${v === o ? ' opcion--marcada' : ''}`}>
                <input type="radio" name={`c${campo.id}`} value={o} checked={v === o}
                       onChange={() => poner(campo.id, o)} />
                <span>{o}</span>
              </label>
            ))}
          </div>
        </fieldset>
      );
    }

    if (campo.input === 'checkbox' || campo.input === 'tags') {
      const esTags = campo.input === 'tags';
      const opciones = (campo.options as any[]) ?? [];
      const marcadas: any[] = v ?? [];
      return (
        <fieldset className="campo" key={campo.id} id={`c${campo.id}`}
                  style={{ border: 0, padding: 0, margin: '0 0 1.9rem' }}>
          <legend className="campo__etiqueta" style={{ padding: 0 }}>
            {etiquetaDe(campo)}
            {campo.required && <span className="campo__obligatorio" aria-hidden="true"> *</span>}
          </legend>
          {ayudaDe(campo) && <span className="campo__ayuda">{ayudaDe(campo)}</span>}
          <div className="opciones">
            {opciones.map((o) => {
              const valorOpcion = esTags ? o.id : o;
              const texto = esTags ? o.tag : o;
              const marcada = marcadas.includes(valorOpcion);
              return (
                <label key={String(valorOpcion)}
                       className={`opcion${marcada ? ' opcion--marcada' : ''}`}>
                  <input type="checkbox" checked={marcada}
                         onChange={() => alternar(campo.id, valorOpcion)} />
                  <span>{texto}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      );
    }

    const largo = campo.input === 'textarea';
    return (
      <div className="campo" key={campo.id}>
        <Etiqueta campo={campo} />
        {largo ? (
          <textarea id={`c${campo.id}`} value={v ?? ''}
                    onChange={(e) => poner(campo.id, e.target.value)} />
        ) : (
          <input id={`c${campo.id}`}
                 type={campo.input === 'number' ? 'number' : 'text'}
                 inputMode={campo.input === 'number' ? 'numeric' : undefined}
                 value={v ?? ''}
                 onChange={(e) =>
                   poner(campo.id,
                     campo.input === 'number'
                       ? (e.target.value === '' ? '' : Number(e.target.value))
                       : e.target.value)} />
        )}
      </div>
    );
  };

  return (
    <form onSubmit={enviar} noValidate>
      {normales.map(pintar)}

      {/*
        RF-22: plegado y al final. Quien está en un barrio con calle asfaltada
        no necesita ni abrirlo; quien está donde solo entra un helicóptero tiene
        aquí lo único que hace que ese helicóptero sepa dónde bajar.
      */}
      {acceso.length > 0 && (
        <details className="acceso">
          <summary className="acceso__titulo">Solo si tu zona es de difícil acceso</summary>
          <p className="campo__ayuda acceso__ayuda">
            Todo esto es opcional y <strong>público</strong>: lo lee quien va en camino.
            Si estás en un sitio al que no se llega por carretera, es lo que más ayuda.
          </p>
          {acceso.map(pintar)}
        </details>
      )}

      {error && (
        <div className="aviso aviso--error" role="alert">
          <p className="aviso__titulo">No se pudo publicar</p>
          <p>{error}</p>
        </div>
      )}

      {bloqueos.length > 0 && (
        <div className="aviso aviso--error" role="alert">
          <p className="aviso__titulo">
            {bloqueos.length === 1 ? 'Corrige esto para publicar' : 'Corrige esto para publicar'}
          </p>
          <ul className="lista-hallazgos">
            {bloqueos.map((h, i) => <li key={i}>{h.texto}</li>)}
          </ul>
        </div>
      )}

      {revision && (
        <div className="aviso aviso--revision" role="alert">
          {revision.parecidas.length > 0 && (
            <>
              <p className="aviso__titulo">
                Ya hay {revision.parecidas.length === 1 ? 'una solicitud publicada' :
                        `${revision.parecidas.length} solicitudes publicadas`} muy cerca
              </p>
              <p>
                Si es el mismo caso, no lo publiques otra vez: los duplicados hacen que dos
                equipos viajen al mismo sitio.
              </p>
              <ul className="solicitudes">
                {revision.parecidas.map((s) => (
                  <li key={s.id} className="solicitud solicitud--sin">
                    <div className="solicitud__titulo">{s.title}</div>
                    <div className="solicitud__meta">
                      {[s.urgencia, s.municipio].filter(Boolean).join(' · ')}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {revision.avisos.length > 0 && (
            <>
              <p className="aviso__titulo">Revisa antes de publicar</p>
              <ul className="lista-hallazgos">
                {revision.avisos.map((h, i) => <li key={i}>{h.texto}</li>)}
              </ul>
            </>
          )}

          <div className="decision">
            <button type="button" className="boton" onClick={confirmarYPublicar}
                    disabled={enviando}>
              {enviando ? 'Publicando…' : 'Es distinta, publicar'}
            </button>
            <button type="button" className="boton boton--secundario"
                    onClick={() => { setRevision(null); window.scrollTo({ top: 0 }); }}>
              Volver a revisar mis datos
            </button>
          </div>
        </div>
      )}

      {!revision && (
        <>
          <button className="boton" type="submit" disabled={enviando}>
            {enviando ? 'Comprobando…' : 'Publicar'}
          </button>
          <p className="campo__ayuda" style={{ marginTop: '0.75rem' }}>
            {FORMULARIOS[slug].pie}
          </p>
        </>
      )}
    </form>
  );
}
