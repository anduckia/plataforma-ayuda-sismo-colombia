'use client';

import { useMemo, useState } from 'react';
import SelectorUbicacion, { type Punto } from './SelectorUbicacion';
import { publicar, esDelEquipo, type Campo, type Encuesta } from '@/lib/ushahidi';

/** El campo de imagen exige subida multipart aparte; queda fuera de esta versión. */
const soportado = (c: Campo) => c.type !== 'media';

function Etiqueta({ campo }: { campo: Campo }) {
  return (
    <>
      <label className="campo__etiqueta" htmlFor={`c${campo.id}`}>
        {campo.label}
        {campo.required && <span className="campo__obligatorio" aria-hidden="true"> *</span>}
        {campo.required && <span className="saltar">(obligatorio)</span>}
      </label>
      {campo.response_private && (
        <span className="campo__candado">🔒 Solo lo ve el equipo verificado</span>
      )}
      {campo.instructions && <span className="campo__ayuda">{campo.instructions}</span>}
    </>
  );
}

export default function Formulario({ encuesta }: { encuesta: Encuesta }) {
  const campos = useMemo(
    () => encuesta.campos.filter((c) => !esDelEquipo(c) && soportado(c)),
    [encuesta],
  );

  const [valores, setValores] = useState<Record<number, any>>({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicadoId, setPublicadoId] = useState<number | null>(null);

  const poner = (id: number, v: any) => setValores((prev) => ({ ...prev, [id]: v }));

  const alternar = (id: number, opcion: any) => {
    const actual: any[] = valores[id] ?? [];
    poner(id, actual.includes(opcion) ? actual.filter((x) => x !== opcion) : [...actual, opcion]);
  };

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const campoTitulo = encuesta.campos.find((c) => c.type === 'title');
    const campoDesc = encuesta.campos.find((c) => c.type === 'description');
    const titulo = String(valores[campoTitulo?.id ?? -1] ?? '').trim();
    if (!titulo) {
      setError('Escribe el primer campo para poder publicar.');
      return;
    }

    // Validación propia: la del navegador no cubre mapa ni casillas.
    const falta = campos.find((c) => {
      if (!c.required) return false;
      const v = valores[c.id];
      return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
    });
    if (falta) {
      setError(`Falta un dato obligatorio: «${falta.label}».`);
      document.getElementById(`c${falta.id}`)?.scrollIntoView({ block: 'center' });
      return;
    }

    setEnviando(true);
    try {
      const id = await publicar(
        encuesta,
        valores,
        titulo,
        String(valores[campoDesc?.id ?? -1] ?? '').trim(),
      );
      setPublicadoId(id);
      window.scrollTo({ top: 0 });
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo publicar. Revisa tu conexión e inténtalo otra vez.');
    } finally {
      setEnviando(false);
    }
  }

  if (publicadoId !== null) {
    return (
      <div className="aviso">
        <p className="aviso__titulo">Publicado. Ya es visible para los equipos de ayuda.</p>
        <p>
          Tu número de solicitud es el <strong>{publicadoId}</strong>. Anótalo: sirve para
          preguntar por ella.
        </p>
        <p>
          El equipo revisa primero las solicitudes críticas. Si dejaste un teléfono, pueden
          llamarte para confirmar.
        </p>
        <p style={{ marginTop: '1.25rem' }}>
          <a className="boton boton--secundario" href="/mapa">Ver el mapa de solicitudes</a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate>
      {campos.map((campo) => {
        const v = valores[campo.id];

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
                {campo.label}
                {campo.required && <span className="campo__obligatorio" aria-hidden="true"> *</span>}
              </legend>
              {campo.instructions && <span className="campo__ayuda">{campo.instructions}</span>}
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
                {campo.label}
                {campo.required && <span className="campo__obligatorio" aria-hidden="true"> *</span>}
              </legend>
              {campo.instructions && <span className="campo__ayuda">{campo.instructions}</span>}
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
      })}

      {error && (
        <div className="aviso aviso--error" role="alert">
          <p className="aviso__titulo">No se pudo publicar</p>
          <p>{error}</p>
        </div>
      )}

      <button className="boton" type="submit" disabled={enviando}>
        {enviando ? 'Publicando…' : 'Publicar'}
      </button>
      <p className="campo__ayuda" style={{ marginTop: '0.75rem' }}>
        Se publica de inmediato, marcado como «sin verificar» hasta que el equipo lo confirme.
      </p>
    </form>
  );
}
