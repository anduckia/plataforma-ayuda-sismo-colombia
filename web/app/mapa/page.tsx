import MapaSolicitudes from '@/components/MapaSolicitudes';
import { traerSolicitudes, type Solicitud } from '@/lib/ushahidi';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mapa de solicitudes — SOS Sismo Colombia' };

function clase(urgencia: string | null): string {
  if (!urgencia) return 'sin';
  if (urgencia.includes('CRÍTICA')) return 'critica';
  if (urgencia.includes('ALTA')) return 'alta';
  if (urgencia.includes('MEDIA')) return 'media';
  return 'sin';
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
            : `${solicitudes.length} solicitudes, ${conPunto} con punto en el mapa. ` +
              'El color indica la urgencia.'}
      </p>

      {!fallo && solicitudes.length > 0 && <MapaSolicitudes solicitudes={solicitudes} />}

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
              <li key={s.id} className={`solicitud solicitud--${clase(s.urgencia)}`}>
                <div className="solicitud__titulo">{s.title}</div>
                <div className="solicitud__meta">
                  {[s.urgencia, s.municipio, cuando(s.fecha)].filter(Boolean).join(' · ')}
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
