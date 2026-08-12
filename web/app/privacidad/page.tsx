import { CONTACTO } from '@/lib/contacto';

export const metadata = {
  title: 'Privacidad y borrado de datos — SOS Sismo Colombia',
  description:
    'Qué se publica, qué no, cuánto dura y cómo pedir que borremos tu publicación o la ' +
    'de un familiar.',
  alternates: { canonical: '/privacidad' },
};

/**
 * RF-19: el canal de supresión (P2).
 *
 * Sin esta página, una persona que publicó a su hermana desaparecida y ya la
 * encontró no tiene forma de pedir que se quite su nombre de internet. La Ley
 * 1581 de 2012 le da ese derecho; hasta ahora aquí no había ni a quién
 * escribirle.
 *
 * Está escrita para que la entienda quien la necesita, no para cubrirnos: ni
 * consentimientos de doce párrafos ni «el titular declara conocer y aceptar».
 */
export default function PaginaPrivacidad() {
  return (
    <>
      <h1>Privacidad y borrado de datos</h1>
      <p className="entradilla">
        Qué se ve, qué no se ve y cómo pedir que lo quitemos.
      </p>

      <h2>Lo que ve cualquiera</h2>
      <p>
        De lo que publicas en <strong>Pido ayuda</strong> y <strong>Busco a un familiar</strong>
        {' '}sale en el mapa: qué está pasando, el nombre o apodo que escribiste, el municipio,
        un punto aproximado, la urgencia y qué necesitas.
      </p>

      <h2>Lo que solo ve el equipo</h2>
      <p>
        Tu <strong>teléfono</strong> y tu <strong>dirección exacta</strong> nunca son
        públicos. Van guardados con candado y solo los ven los ayudantes que el equipo
        verificó por teléfono, uno por uno, para poder llegar hasta ti.
      </p>
      <p>
        <strong>Quiero ayudar</strong> y <strong>Ofrezco recursos</strong> no salen al mapa:
        los lee solo el equipo.
      </p>
      <p>
        Tampoco se publica quién publicó. Aquí no hay cuentas de usuario, así que no hay
        nombre que mostrar.
      </p>

      <h2>Esto no sale en Google</h2>
      <p>
        Le pedimos a los buscadores que no indexen el sitio: así el nombre de una persona
        desaparecida no queda colgado en internet después de que aparezca.
      </p>
      <p>
        Por eso la plataforma se difunde a mano, por canales de emergencia —WhatsApp, radio,
        SMS—. No buscamos que se vuelva viral: eso llenaría el mapa de reportes falsos y le
        haría perder tiempo a quien está rescatando.
      </p>

      <h2>Si publicas por otra persona</h2>
      <p>
        Puedes hacerlo, y muchas veces es lo correcto: quien está atrapado no puede llenar un
        formulario. Escribe solo lo que hace falta para que la ayuda llegue, y si pones el
        teléfono de alguien más en un campo público, pídele permiso antes.
      </p>
      <p>
        Lo de heridos, embarazo o discapacidad es <strong>opcional</strong>. Solo sirve para
        priorizar, y puedes dejarlo en blanco.
      </p>

      <h2>Cómo pedir que lo borremos</h2>
      <p>
        Puedes pedir que corrijamos o borremos una publicación —la tuya o la de un familiar—
        cuando quieras y sin dar explicaciones. Es tu derecho según la Ley 1581 de 2012.
      </p>
      <div className="aviso">
        <p className="aviso__titulo">Escríbenos a {CONTACTO}</p>
        <p>
          Dinos el <strong>número de solicitud</strong> (te lo dimos al publicar) o el título
          de la publicación, y qué quieres: corregir un dato o quitarla del todo.
        </p>
        <p style={{ marginBottom: 0 }}>
          Respondemos en cuanto podemos. En los primeros días el equipo está atendiendo
          rescates, así que puede tardar.
        </p>
      </div>
      <p>
        Si ya encontraste a tu familiar, avísanos aunque no quieras borrar nada: cambiamos la
        publicación a «Localizada» y dejamos de mandar gente a buscarla.
      </p>

      <h2>Cuánto dura esto</h2>
      <p>
        Durante la emergencia no borramos nada por nuestra cuenta: una solicitud que
        desaparece a media noche es un equipo que deja de ir. Cuando la operación termine,
        cerramos el mapa y destruimos los datos de contacto. Lo que pidas borrar antes, lo
        borramos antes.
      </p>

      <h2>Lo que nunca vamos a hacer</h2>
      <p>
        <strong>Nunca te vamos a pedir dinero, claves ni números de cuenta.</strong> Si
        alguien lo hace en nombre de este sitio, es un fraude: no le pagues y avísanos.
      </p>
      <p>
        No vendemos ni cedemos estos datos a nadie. Se usan para que la ayuda llegue, y para
        nada más.
      </p>

      <p className="pie">
        <a href="/">Volver al inicio</a> · <a href="/mapa">Ver el mapa</a>
      </p>
    </>
  );
}
