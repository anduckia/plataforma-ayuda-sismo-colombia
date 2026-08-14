import { CONTACTO, MENSAJES_DIRECTOS } from '@/lib/contacto';

export const metadata = {
  title: 'Privacidad — SOS Sismo Colombia',
  description:
    'Este sitio no recibe ni guarda datos de nadie. Qué pasó con lo que se publicó antes ' +
    'y cómo pedir que lo quitemos.',
};

/**
 * Reescrita para el directorio (RF-37).
 *
 * La versión anterior explicaba qué salía al mapa, qué campos iban con candado
 * y cómo pedir que se borrara una publicación. Nada de eso existe ya, y una
 * página de privacidad que describe un sistema que se retiró es peor que no
 * tenerla: quien la lee cree que sus datos siguen en alguna parte.
 *
 * Escrita para que la entienda quien la necesita, no para cubrirnos.
 */
export default function PaginaPrivacidad() {
  return (
    <>
      <h1>Privacidad</h1>
      <p className="entradilla">
        Este sitio ya no recibe datos de nadie. Esto es lo que eso significa.
      </p>

      <h2>No te pedimos nada</h2>
      <p>
        Aquí no hay formularios, no hay que crear cuenta y no hay nada que llenar. Puedes
        leer todo el directorio sin escribir una sola letra sobre ti.
      </p>

      <h2>Lo que se publicó antes ya no está</h2>
      <p>
        Durante los primeros días este sitio recibía solicitudes de ayuda y las mostraba en
        un mapa. Eso se retiró: <strong>el mapa y los formularios ya no existen</strong>, y
        con ellos dejó de estar público lo que se hubiera publicado ahí.
      </p>
      <p>
        Si crees que algo tuyo o de un familiar sigue visible en alguna parte, escríbenos y
        lo revisamos. No hace falta que expliques por qué.
      </p>

      <h2>Los enlaces llevan a sitios de otros</h2>
      <p>
        El directorio manda a páginas, cuentas y grupos que no son nuestros. Cuando tocas un
        enlace sales de aquí, y lo que pase allá se rige por las reglas de ese sitio, no por
        las nuestras. Por eso cada ficha te dice a dónde va antes de que toques.
      </p>
      <p>
        Tampoco publicamos datos de contacto de personas particulares ni ofertas
        individuales: solo fuentes que se mantienen en el tiempo.
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
          avísanos: es el error que más daño hace, porque desvía a alguien que necesita
          ayuda hoy.
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
