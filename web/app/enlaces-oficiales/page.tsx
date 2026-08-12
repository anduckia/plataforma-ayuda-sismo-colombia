import LineasEmergencia from '@/components/LineasEmergencia';
import {
  ADVERTENCIA, DONACIONES, FAMILIARES, INFORMACION,
  VERIFICADO, VIVIENDA, type Enlace,
} from '@/lib/enlaces';

export const metadata = {
  title: 'Canales oficiales — SOS Sismo Colombia',
  description:
    'Líneas de emergencia, búsqueda de familiares por la Cruz Roja, reporte de vivienda ' +
    'dañada, donaciones e información oficial tras el sismo. Enlaces directos, verificados.',
  alternates: { canonical: '/enlaces-oficiales' },
};

function Bloque({
  id, titulo, entradilla, enlaces,
}: {
  id: string; titulo: string; entradilla: string; enlaces: Enlace[];
}) {
  return (
    <section className="bloque" id={id}>
      <h2>{titulo}</h2>
      <p className="entradilla">{entradilla}</p>
      <ul className="enlaces">
        {enlaces.map((e) => (
          <li key={e.url} className="enlace">
            <a className="enlace__titulo" href={e.url} target="_blank" rel="noopener noreferrer">
              {e.titulo}
            </a>
            <span className="enlace__que">{e.que}</span>
            {e.detalle && <span className="enlace__detalle">{e.detalle}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function EnlacesOficiales() {
  return (
    <>
      <h1>Canales oficiales</h1>
      <p className="entradilla">
        No reemplazamos a nadie. Para casi todo lo que necesitas, quien responde está aquí.
      </p>

      {/*
        RF-25: la advertencia encabeza todo. Tras un desastre circulan más
        cadenas que datos, y las estafas de donaciones llegan antes que la ayuda.
      */}
      <div className="aviso aviso--error">
        <p className="aviso__titulo">⚠️ Antes de reenviar nada</p>
        <p style={{ marginBottom: 0 }}>{ADVERTENCIA}</p>
      </div>

      <LineasEmergencia />

      {/*
        Los dos celulares de la Defensa Civil del Chocó salieron el 12-ago-2026
        (RF-25, ADR-022): un celular de coordinación cambia de manos en días y
        nadie aquí lo va a ver caducar. El 144 es su línea nacional, no caduca,
        y ya está en el bloque de arriba.
      */}

      <Bloque
        id="familiares"
        titulo="No encuentro a un familiar"
        entradilla="Empieza por la Cruz Roja: es el canal con más alcance y el único que
                    conecta con la red internacional. Después, el registro oficial del Estado."
        enlaces={FAMILIARES}
      />
      <p className="campo__ayuda">
        Haz las dos cosas: registra el caso ahí <strong>y</strong>{' '}
        <a href="/busco-familiar">publícalo aquí</a> para que más ojos lo busquen.
      </p>

      <Bloque
        id="vivienda"
        titulo="Mi casa quedó dañada"
        entradilla="Para cuando la estructura está afectada pero no hay nadie en peligro. Si
                    hay alguien dentro o riesgo de colapso, llama al 123."
        enlaces={VIVIENDA}
      />

      <Bloque
        id="donaciones"
        titulo="Quiero donar"
        entradilla="Te enlazamos a la página de cada organización en vez de copiar aquí sus
                    números de cuenta: un dígito mal transcrito manda tu dinero al lugar
                    equivocado. Nosotros nunca recibimos dinero."
        enlaces={DONACIONES}
      />

      <Bloque
        id="informacion"
        titulo="Información oficial"
        entradilla="Magnitud, réplicas, balances y estado de las vías. Si vas a mover un
                    convoy, mira el reporte de Invías antes de salir."
        enlaces={INFORMACION}
      />

      <p className="pie">
        Comprobamos uno a uno todos los enlaces y números de esta página el{' '}
        <strong>{VERIFICADO}</strong>. Si encuentras alguno que ya no funciona, escríbenos y
        lo corregimos. · <a href="/">Volver al inicio</a>
      </p>
    </>
  );
}
