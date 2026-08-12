import { CONTACTO } from '@/lib/contacto';

export const metadata = {
  title: 'Privacidad y borrado de datos — SOS Sismo Colombia',
  description:
    'Qué se publica, qué no, cuánto dura y cómo pedir que borremos tu publicación o la ' +
    'de un familiar.',
};

/**
 * Cuándo se comprobó dónde está alojado esto (RF-26, ADR-022): dónde vive un dato
 * es un hecho que caduca, así que se fecha como los teléfonos de emergencia.
 * Medido el 12-ago-2026 sin credenciales; el detalle técnico está en ADR-024.
 */
const ALOJAMIENTO_VERIFICADO = '12 de agosto de 2026';

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

      <h2>Dónde viven tus datos</h2>
      <p>
        Esta plataforma se apoya en servicios de otros: lo que escribes queda guardado en
        servidores en <strong>Irlanda</strong>, y la página te llega desde{' '}
        <strong>Estados Unidos</strong>. Los dos son sitios con leyes de protección de
        datos reconocidas en Colombia.
      </p>
      <p>
        Por esos datos respondemos nosotros, el equipo que sostiene esta plataforma.
        Escríbenos a <strong>{CONTACTO}</strong> si quieres corregir algo, borrarlo o
        preguntar.
      </p>
      <p className="nota">Comprobado el {ALOJAMIENTO_VERIFICADO}.</p>

      {/*
        Este texto se reescribió el 12-ago-2026 con la indexación selectiva
        (ADR-023): antes decía que no se indexa «el sitio», y desde ese cambio
        solo /mapa queda fuera. Decirlo mal aquí sería prometer una protección
        más ancha de la que hay, en la única página donde alguien viene a
        comprobar exactamente eso.
      */}
      <h2>Lo que publicas no sale en Google</h2>
      <p>
        Les pedimos a los buscadores que dejen el <a href="/mapa">mapa</a> fuera, porque ahí
        es donde están las solicitudes: así el nombre de una persona desaparecida no queda
        colgado en internet después de que aparezca. El resto del sitio —esta página, el
        inicio y los formularios en blanco— sí se puede encontrar, para que quien necesita
        ayuda dé con nosotros aunque nadie le haya pasado el enlace.
      </p>
      <p>
        Aun así, la plataforma se difunde sobre todo a mano, por los canales que de verdad
        llegan a la zona: WhatsApp, radio y SMS.
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
        Durante la emergencia no borramos nada por nuestra cuenta: si una solicitud
        desaparece de un momento a otro, puede quedarse sin la ayuda que ya venía en
        camino. Cuando la operación termine, cerramos el mapa y borramos los datos de
        contacto. Lo que pidas borrar antes, lo borramos antes.
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
