import Frescura from '@/components/Frescura';
import MapaSolicitudes from '@/components/MapaSolicitudes';
import { traerSolicitudes, type Solicitud } from '@/lib/ushahidi';
import { COLORES, LEYENDA, nivelDe } from '@/lib/colores';
import { CONTACTO } from '@/lib/contacto';
import { HORAS_SIN_CONFIRMAR, sinConfirmar } from '@/lib/frescura';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Mapa de solicitudes — SOS Sismo Colombia',
  description:
    'Mapa de las solicitudes de ayuda y las búsquedas de familiares publicadas tras el ' +
    'sismo. El color indica la urgencia. Los teléfonos y las direcciones exactas no aparecen.',
};

/**
 * El recuento por urgencia, que es a la vez la leyenda (RF-16).
 *
 * «14 solicitudes» no le dice nada a quien tría: lo que hace falta saber de un
 * vistazo es cuántas están en rojo. Se omiten los niveles sin nada, porque un
 * color que no está en el mapa no hay que descifrarlo.
 */
function recuento(solicitudes: Solicitud[]) {
  return LEYENDA
    .map((l) => ({ ...l, n: solicitudes.filter((s) => nivelDe(s) === l.nivel).length }))
    .filter((l) => l.n > 0);
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
  const fichas = recuento(solicitudes);
  // `force-dynamic`: esta página se renderiza en cada petición, así que la hora
  // del servidor es la hora real de la consulta y no una caché disfrazada.
  const consultadoEn = new Date().toISOString();
  const ultimaSolicitud = solicitudes[0]?.fecha ?? null;

  return (
    <>
      <h1>Mapa de solicitudes</h1>
      <p className="entradilla">
        {fallo
          ? 'No pudimos cargar las solicitudes en este momento. Vuelve a intentarlo en unos minutos.'
          : solicitudes.length === 0
            ? 'Todavía no hay solicitudes publicadas.'
            : 'Cada punto es alguien que pidió ayuda. El color dice qué tan urgente es.'}
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
          <p className="aviso__titulo">Aquí no están todas</p>
          <p style={{ marginBottom: 0 }}>
            Hay más solicitudes de las que caben en esta página, y las que faltan son las
            más antiguas. Para el listado completo, usa el panel de la plataforma.
          </p>
        </div>
      )}

      {/*
        La leyenda y el recuento en una sola fila de fichas, y el mapa justo
        detrás. Antes iban delante dos avisos largos que había que atravesar
        para llegar a lo único que se viene a ver.
      */}
      {!fallo && solicitudes.length > 0 && (
        <>
          <ul className="recuento" aria-label="Solicitudes por urgencia">
            {fichas.map(({ nivel, uno, varios, n }) => (
              <li key={nivel}>
                <span className="recuento__punto" style={{ background: COLORES[nivel] }} />
                <strong>{n}</strong> {n === 1 ? uno : varios}
              </li>
            ))}
          </ul>
          <MapaSolicitudes solicitudes={solicitudes} />
          <p className="nota">
            {conPunto === solicitudes.length
              ? 'Todas tienen punto en el mapa.'
              : `${conPunto} de ${solicitudes.length} tienen punto en el mapa. El resto solo aparece en la lista.`}
          </p>
        </>
      )}

      {!fallo && solicitudes.length === 0 && (
        <div className="vacio">
          <p>En cuanto alguien publique una solicitud, aparecerá aquí y en el mapa.</p>
          <p style={{ marginBottom: 0 }}><a href="/">Publicar una solicitud</a></p>
        </div>
      )}

      {solicitudes.length > 0 && (
        <>
          <h2>Lista</h2>
          {/*
            RF-17 en positivo. La versión anterior explicaba «Sin verificar»
            negando: «no quiere decir que sea falsa». Para negar «falsa» hay que
            nombrarla, y cuatro párrafos defendiendo que los reportes son ciertos
            hacen dudar de que lo sean. Lo que se dice ahora es el hecho —el
            equipo va llamando por orden de urgencia— y de ahí se deduce solo
            que la insignia falta porque aún no han llamado, no porque nadie
            crea al que publicó.
          */}
          <p className="nota">
            El equipo va llamando caso por caso, empezando por los más urgentes: la insignia
            verde aparece cuando ya llamó. El reloj ⏳ dice cuánto lleva esperando un caso
            —pasadas {HORAS_SIN_CONFIRMAR} horas— para que nadie lo dé por atendido.
          </p>
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
                    {/*
                      «Sin verificar» describía la solicitud; «Pendiente de
                      verificar» describe el trabajo del equipo, que es lo que
                      de verdad está pasando. Dice exactamente lo mismo sobre la
                      confianza —solo la insignia verde vale (RF-17)— sin que se
                      lea como un reparo hacia quien publicó.
                    */}
                    <span className={`etiqueta${s.verificada ? ' etiqueta--verificada' : ''}`}>
                      {s.verificada ? '✔️ Verificada por el equipo' : 'Pendiente de verificar'}
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
        Los teléfonos y las direcciones exactas nunca aparecen aquí: solo los ven los
        ayudantes verificados por el equipo.
        {solicitudes.length > 0 && (
          <> ¿Sabes que un caso ya se resolvió? Escríbenos a <strong>{CONTACTO}</strong> con
          su número y lo cerramos: eso libera equipos hacia otros frentes.</>
        )}
        {' '}· <a href="/privacidad">Privacidad y borrado de datos</a> ·{' '}
        <a href="/">Volver al inicio</a>
      </p>
    </>
  );
}
