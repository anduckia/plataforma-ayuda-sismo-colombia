import MapaSolicitudes from '@/components/MapaSolicitudes';
import { traerSolicitudes, type Solicitud } from '@/lib/ushahidi';
import { COLORES, LEYENDA, nivelDe } from '@/lib/colores';

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
  let fallo = false;
  try {
    solicitudes = await traerSolicitudes();
  } catch {
    fallo = true;
  }

  const conPunto = solicitudes.filter((s) => s.punto).length;

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

      {!fallo && solicitudes.length > 0 && (
        <>
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
            {solicitudes.map((s) => (
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
                  {s.necesidades.map((n) => <span key={n} className="etiqueta">{n}</span>)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="pie">
        Los teléfonos y las direcciones exactas no aparecen aquí: solo los ven los ayudantes
        verificados por el equipo. · <a href="/">Volver al inicio</a>
      </p>
    </>
  );
}
