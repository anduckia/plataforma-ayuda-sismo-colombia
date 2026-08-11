import Frescura from '@/components/Frescura';
import MapaSolicitudes from '@/components/MapaSolicitudes';
import { traerSolicitudes, type Solicitud } from '@/lib/ushahidi';
import { COLORES, LEYENDA, nivelDe } from '@/lib/colores';
import { HORAS_SIN_CONFIRMAR, sinConfirmar } from '@/lib/frescura';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Mapa de solicitudes — SOS Sismo Colombia',
  description:
    'Mapa de las solicitudes de ayuda y las búsquedas de familiares publicadas tras el ' +
    'sismo. El color indica la urgencia. Los teléfonos y las direcciones exactas no aparecen.',
};

const plural = (n: number, singular: string, plural_: string) =>
  `${n} ${n === 1 ? singular : plural_}`;

/**
 * El recuento desglosado: «14 solicitudes» no le dice nada a quien tría. Lo que
 * hace falta saber de un vistazo es cuántas están en rojo (RF-16).
 */
function resumen(solicitudes: Solicitud[]): string {
  const cuenta = (nivel: string) =>
    solicitudes.filter((s) => nivelDe(s) === nivel).length;

  const busquedas = cuenta('busqueda');
  const auxilio = solicitudes.length - busquedas;

  const partes: string[] = [];
  if (auxilio > 0) {
    const desglose = [
      cuenta('critica') && `${cuenta('critica')} críticas`,
      cuenta('alta') && `${cuenta('alta')} altas`,
      cuenta('media') && `${cuenta('media')} medias`,
      cuenta('sin') && `${cuenta('sin')} sin urgencia indicada`,
    ].filter(Boolean) as string[];
    partes.push(
      plural(auxilio, 'solicitud de ayuda', 'solicitudes de ayuda') +
      (desglose.length ? ` (${desglose.join(', ')})` : ''),
    );
  }
  if (busquedas > 0) {
    partes.push(plural(busquedas, 'búsqueda de familiar', 'búsquedas de familiar'));
  }
  return partes.join(' y ') + '.';
}

const cuando = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString('es-CO', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
        timeZone: 'America/Bogota',
      });
};

export default async function PaginaMapa() {
  let solicitudes: Solicitud[] = [];
  let completo = true;
  let fallo = false;
  try {
    ({ solicitudes, completo } = await traerSolicitudes());
  } catch {
    fallo = true;
  }

  const conPunto = solicitudes.filter((s) => s.punto).length;
  // `force-dynamic`: esta página se renderiza en cada petición, así que la hora
  // del servidor es la hora real de la consulta y no una caché disfrazada.
  const consultadoEn = new Date().toISOString();
  const ultimaSolicitud = solicitudes[0]?.fecha ?? null;

  return (
    <>
      <h1>Solicitudes publicadas</h1>
      <p className="entradilla">
        {fallo
          ? 'No pudimos cargar las solicitudes en este momento.'
          : solicitudes.length === 0
            ? 'Todavía no hay solicitudes publicadas.'
            : `${resumen(solicitudes)} ${conPunto} con punto en el mapa.`}
      </p>

      <Frescura consultadoEn={consultadoEn} ultimaSolicitud={ultimaSolicitud} />

      {/*
        RF-18: si el listado viene recortado hay que decirlo. Un mapa que
        enseña 5000 de 7000 sin avisar hace creer que los 2000 que faltan no
        existen, y las que se caen son justamente las más viejas: las que
        llevan más tiempo esperando a que alguien llegue.
      */}
      {!fallo && !completo && (
        <div className="aviso aviso--error" role="alert">
          <p className="aviso__titulo">Esta página no las está mostrando todas</p>
          <p>
            Hay más solicitudes de las que caben aquí y faltan las más antiguas. Para
            trabajar con el listado completo, usa el panel de la plataforma.
          </p>
        </div>
      )}

      {!fallo && solicitudes.length > 0 && (
        <>
          <div className="aviso" style={{ marginBottom: '1.25rem' }}>
            <p className="aviso__titulo">ℹ️ ¿Qué significa «Sin verificar»?</p>
            <p style={{ marginBottom: 0 }}>
              Es el estado inicial automático de todo reporte al ingresar. Significa que el caso
              está en cola de atención del equipo. <strong>No significa que la solicitud sea falsa.</strong>
              {' '}Las solicitudes se atienden prioritariamente según su nivel de Urgencia (🔴 Crítica / 🟠 Alta).
            </p>
            <p style={{ marginBottom: 0, marginTop: '0.75rem' }}>
              La etiqueta <strong>⏳ Sin confirmar</strong> aparece pasadas {HORAS_SIN_CONFIRMAR} horas
              y dice cuánto lleva esperando. <strong>No significa que ya no haga falta</strong> —
              suele significar lo contrario: que nadie ha llegado todavía. Si sabes que un caso
              ya se resolvió, escríbenos a <strong>sossismocolombia@gmail.com</strong> con su
              número y lo cerramos, que libera equipos hacia otros frentes.
            </p>
          </div>
          <ul className="leyenda">
            {LEYENDA.map(({ nivel, texto }) => (
              <li key={nivel}>
                <span className="leyenda__punto" style={{ background: COLORES[nivel] }} />
                {texto}
              </li>
            ))}
          </ul>
          <MapaSolicitudes solicitudes={solicitudes} />
        </>
      )}

      {!fallo && solicitudes.length === 0 && (
        <div className="vacio">
          <p>Cuando alguien publique una solicitud, aparecerá aquí y en el mapa.</p>
          <p style={{ marginBottom: 0 }}><a href="/">Publicar una solicitud</a></p>
        </div>
      )}

      {solicitudes.length > 0 && (
        <>
          <h2>Lista</h2>
          <ul className="solicitudes">
            {solicitudes.map((s) => {
              const espera = sinConfirmar(s);
              return (
                <li key={s.id} className={`solicitud solicitud--${nivelDe(s)}`}>
                  <div className="solicitud__titulo">{s.title}</div>
                  <div className="solicitud__meta">
                    {[
                      s.tipo === 'busqueda' ? 'Busco a un familiar' : s.urgencia,
                      s.municipio,
                      cuando(s.fecha),
                    ].filter(Boolean).join(' · ')}
                  </div>
                  <div className="etiquetas">
                    {s.estado && <span className="etiqueta">{s.estado}</span>}
                    <span className={`etiqueta${s.verificada ? ' etiqueta--verificada' : ''}`}>
                      {s.verificada ? '✔️ Verificada por el equipo' : 'Sin verificar'}
                    </span>
                    {/*
                      RF-23 y ADR-021: se anota el tiempo y NO se toca ni el
                      color ni el orden. Una crítica que lleva 14 horas sin que
                      nadie confirme es la que peor está, no la que sobra.
                    */}
                    {espera && (
                      <span className="etiqueta etiqueta--espera">⏳ Sin confirmar {espera}</span>
                    )}
                    {s.necesidades.map((n) => <span key={n} className="etiqueta">{n}</span>)}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <p className="pie">
        Los teléfonos y las direcciones exactas no aparecen aquí: solo los ven los ayudantes
        verificados por el equipo.
      </p>
      {/*
        RF-17: qué significa exactamente la insignia. «Sin verificar» es lo
        normal y no quiere decir «falsa»: quiere decir que todavía nadie del
        equipo la ha confirmado, y que hay que tratarla como lo que es, el
        aviso de una persona a la que aún no se ha llamado.
      */}
      <p className="pie">
        Cualquiera puede publicar sin cuenta, así que <strong>casi todo aparece «sin
        verificar»</strong>: nadie del equipo lo ha confirmado todavía. La insignia verde
        solo la pone el equipo tras comprobar el caso, y no se puede poner desde el
        formulario. · <a href="/privacidad">Privacidad y borrado de datos</a> ·{' '}
        <a href="/">Volver al inicio</a>
      </p>
    </>
  );
}
