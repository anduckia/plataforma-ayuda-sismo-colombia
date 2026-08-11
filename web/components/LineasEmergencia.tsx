import { LINEAS } from '@/lib/enlaces';

/**
 * Las líneas nacionales, en todas las páginas (RF-25, T-038).
 *
 * Va en el pie, no arriba. Arriba está el 123 y solo el 123 (RNF-06): apilar
 * siete números sobre el formulario lo empuja fuera de la pantalla de un móvil
 * justo cuando alguien intenta pedir ayuda. Aquí abajo está para quien busca
 * un número concreto, que es otro momento y otra necesidad.
 */
export default function LineasEmergencia({ compacto = false }: { compacto?: boolean }) {
  return (
    <section className={`lineas${compacto ? ' lineas--compacto' : ''}`}
             aria-label="Líneas de emergencia nacionales">
      <h2 className="lineas__titulo">Líneas de emergencia</h2>
      <ul className="lineas__lista">
        {LINEAS.map((l) => (
          <li key={l.numero}>
            <a className="lineas__numero" href={`tel:${l.numero}`}>{l.numero}</a>
            <span className="lineas__quien">{l.quien}</span>
            {!compacto && l.nota && <span className="lineas__nota">{l.nota}</span>}
          </li>
        ))}
      </ul>
      <p className="lineas__pie">
        Son gratuitas y funcionan desde cualquier teléfono.{' '}
        <a href="/enlaces-oficiales">Ver todos los canales oficiales</a>
      </p>
    </section>
  );
}
