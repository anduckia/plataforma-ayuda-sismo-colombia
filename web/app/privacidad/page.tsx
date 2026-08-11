import { CONTACTO } from '@/lib/contacto';

export const metadata = {
  title: 'Privacidad y borrado de datos — SOS Sismo Colombia',
  description:
    'Qué se publica, qué no, cuánto dura y cómo pedir que borremos tu publicación o la ' +
    'de un familiar.',
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
        Lo que publicas en <strong>Pido ayuda</strong> y <strong>Busco a un familiar</strong>
        {' '}sale en el mapa público: lo que está pasando, el nombre o apodo que escribiste,
        el municipio, un punto aproximado en el mapa, la urgencia y qué necesitas.
      </p>

      <h2>Lo que no ve nadie más que el equipo</h2>
      <p>
        Tu <strong>teléfono</strong> y tu <strong>dirección exacta</strong> nunca son
        públicos. Los guardamos marcados con candado y solo los ven los ayudantes que el
        equipo verificó por teléfono, uno por uno, para poder llegar hasta ti.
      </p>
      <p>
        Los formularios de <strong>Quiero ayudar</strong> y <strong>Ofrezco recursos</strong>
        {' '}no salen al mapa: los lee solo el equipo.
      </p>
      <p>
        Tampoco se publica quién publicó: el nombre de la cuenta no aparece, y para publicar
        no hace falta cuenta ninguna.
      </p>

      <h2>Esta página no sale en Google</h2>
      <p>
        Le pedimos a los buscadores que no indexen el sitio, para que el nombre de una
        persona desaparecida no quede colgado en internet después de que aparezca. La
        plataforma se difunde de forma consciente y selectiva por canales de emergencia (ejem. WhatsApp, radio y SMS), evitando la viralidad para no saturar el sistema con reportes falsos que entorpezcan a los organismos de control.
      </p>

      <h2>Si publicas por otra persona</h2>
      <p>
        Puedes hacerlo, y en una emergencia muchas veces es lo correcto: quien está atrapado
        no puede llenar un formulario. Pero escribe solo lo que hace falta para que la ayuda
        llegue. Si pones el teléfono de otra persona en un campo público, pídele permiso
        antes.
      </p>
      <p>
        Lo de heridos, embarazo o discapacidad es <strong>opcional</strong>. Solo sirve para
        priorizar, y puedes dejarlo en blanco.
      </p>

      <h2>Cómo pedir que lo borremos</h2>
      <p>
        Puedes pedir que corrijamos o borremos una publicación —la tuya o la de un familiar—
        en cualquier momento y sin dar explicaciones. Es tu derecho según la Ley 1581 de
        2012.
      </p>
      <div className="aviso">
        <p className="aviso__titulo">Escríbenos</p>
        <p>
          A <strong>{CONTACTO}</strong>, con el <strong>número de solicitud</strong> (te lo
          dimos al publicar) o el título de la publicación, y qué quieres: corregir un dato,
          o quitarla del todo.
        </p>
        <p style={{ marginBottom: 0 }}>
          Respondemos en cuanto podemos. Durante los primeros días de la emergencia el
          equipo está atendiendo rescates, así que puede tardar.
        </p>
      </div>
      <p>
        Si alguien encontró a su familiar, avísanos igual aunque no quieras borrar nada:
        cambiamos la publicación a «Localizada» y dejamos de mandar gente a buscarla.
      </p>

      <h2>Cuánto dura esto</h2>
      <p>
        Durante la emergencia no borramos nada por nuestra cuenta: una solicitud que
        desaparece a media noche es un equipo que deja de ir. Cuando la operación termine,
        el mapa público se cierra y los datos de contacto se destruyen. Lo que pidas borrar
        antes, lo borramos antes.
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
