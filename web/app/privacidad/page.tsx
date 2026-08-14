import { CONTACTO, MENSAJES_DIRECTOS } from '@/lib/contacto';

export const metadata = {
  title: 'Privacidad — SOS Sismo Colombia',
  description:
    'Qué es este directorio, qué pasa cuando sales a otro sitio desde aquí y cómo ' +
    'escribirnos.',
};

/**
 * Reescrita para el directorio (RF-37) y adelgazada el 14-ago-2026.
 *
 * La versión original explicaba qué salía al mapa y cómo pedir que se borrara
 * una publicación; la siguiente explicaba que ya no se recibe nada. El equipo
 * retiró también esa segunda capa: el sitio no recibe nada de quien lo lee, así
 * que ponerse a explicar qué NO hacemos con datos que no existen daba justo la
 * impresión contraria — que en alguna parte hay algo guardado.
 *
 * Queda lo que sí le pasa a quien lee: que los enlaces lo sacan de aquí, cómo
 * escribirnos y que nadie le va a pedir dinero en nombre del sitio.
 */
export default function PaginaPrivacidad() {
  return (
    <>
      <h1>Privacidad</h1>
      <p className="entradilla">
        Este sitio es una lista de enlaces. Esto es lo que eso significa para ti.
      </p>

      <h2>Los enlaces llevan a sitios de otros</h2>
      <p>
        El directorio manda a páginas, cuentas y grupos que no son nuestros. Cuando tocas un
        enlace sales de aquí, y lo que pase allá se rige por las reglas de ese sitio, no por
        las nuestras. Por eso cada ficha te dice a dónde va antes de que toques.
      </p>

      <h2>Cómo escribirnos</h2>
      <div className="aviso">
        <p className="aviso__titulo">Para pedir que quitemos algo, o para avisarnos de un error</p>
        <p>
          A <strong>{CONTACTO}</strong>.
          {MENSAJES_DIRECTOS.length > 0 && (
            <>
              {' '}También por mensaje directo en{' '}
              {MENSAJES_DIRECTOS.map(({ red }) => red).join(' o ')}.
            </>
          )}
        </p>
        <p>
          Si una ficha lleva a un sitio equivocado o a una cuenta que no es quien dice ser,
          avísanos.
        </p>
      </div>

      <h2>Lo que nunca vamos a hacer</h2>
      <p>
        <strong>Nunca te vamos a pedir dinero, claves ni números de cuenta.</strong> Si
        alguien lo hace en nombre de este sitio, es un fraude: no le pagues y avísanos.
      </p>

      <p className="pie">
        <a href="/">Volver al directorio</a>
      </p>
    </>
  );
}
