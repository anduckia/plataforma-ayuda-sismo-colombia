/**
 * Lo que ve quien llega por un enlace de los primeros días (RF-37).
 *
 * Las cuatro URLs de los formularios y la del mapa se dictaron por radio y
 * circularon por WhatsApp. Un 404 le dice a esa persona que se equivocó, y lo
 * que pasó es lo contrario: el sitio cambió. Peor aún, quien venía a pedir
 * ayuda concluiría que la plataforma se cayó justo cuando la necesitaba.
 *
 * Por eso esto explica el cambio, repite a dónde llamar si hay urgencia, y
 * lleva al directorio.
 */
export default function Retirado({ que }: { que: string }) {
  return (
    <>
      <h1>{que} ya no está aquí</h1>

      <div className="aviso">
        <p className="aviso__titulo">Este sitio cambió</p>
        <p>
          Dejamos de recibir solicitudes. Ahora esto es un <strong>directorio</strong>:
          una lista de dónde encontrar albergues, ayuda, búsqueda de personas,
          voluntariado y canales oficiales, con la fecha en que revisamos cada uno.
        </p>
        <p>
          Si necesitas ayuda, en el directorio están los sitios que sí la reciben.
        </p>
      </div>

      <p>
        <strong>¿Hay una vida en riesgo ahora?</strong> Llama al{' '}
        <a href="tel:123">123</a>, como siempre.
      </p>

      <div className="aportar__vias">
        <a className="aportar__via" href="/">Ir al directorio</a>
      </div>
    </>
  );
}
