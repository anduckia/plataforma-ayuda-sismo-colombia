import Ficha from '@/components/Ficha';
import { CONTACTO, MENSAJES_DIRECTOS } from '@/lib/contacto';
import { FUENTES, VACIOS } from '@/lib/fuentes-datos';
import { revisar, TEMAS, type TemaId } from '@/lib/fuentes';
import { haceCuanto, hoyEnBogota, resumenDelInventario } from '@/lib/fecha';

/**
 * Media hora. Los datos son estáticos, pero la ANTIGÜEDAD de cada revisión se
 * calcula contra el día de hoy: una página construida una vez congela el «hace
 * 5 días» y al séptimo está mintiendo, que es justo lo que RF-34 impide.
 */
export const revalidate = 1800;

const plural = (n: number, uno: string, varios: string) =>
  `${n} ${n === 1 ? uno : varios}`;

/**
 * Lo que se pinta cuando un tema no tiene fichas.
 *
 * La distinción importa: una nota escrita a mano afirma que alguien buscó y no
 * encontró, y eso vale más que rellenar. El texto por defecto NO afirma eso —
 * dice que no hemos cargado nada, que es lo único cierto mientras nadie haya
 * buscado. Confundir las dos cosas es prometer trabajo que no se hizo.
 */
function SinFichas({ tema }: { tema: TemaId }) {
  const nota = VACIOS.find((v) => v.tema === tema);

  if (!nota) {
    return (
      <div className="falta">
        <p>Todavía no hemos cargado fuentes de este tema.</p>
      </div>
    );
  }

  return (
    <div className="falta">
      <p>{nota.texto}</p>
      {nota.cola && <p>{nota.cola}</p>}
    </div>
  );
}

export default function Directorio() {
  const hoy = hoyEnBogota();
  const { validas, descartadas } = revisar(FUENTES, hoy);

  // Falla cerrado: la ficha mala no se pinta, pero queda registrada para que
  // alguien la arregle en vez de desaparecer en silencio.
  for (const { fuente, problemas } of descartadas) {
    console.warn(`[directorio] «${fuente.nombre || fuente.id}» no se publica: ${problemas.join('; ')}`);
  }

  const porTema = (tema: TemaId) => validas.filter((f) => f.tema === tema);
  const inventario = resumenDelInventario(validas.map((f) => f.revisado), hoy);

  return (
    <>
      <h1>¿Dónde está cada cosa?</h1>
      {/*
        Una frase, solo qué es la página. Lo demás que llegó a estar aquí —que
        no pedimos dinero, que cada ficha lleva fecha— vive donde no compite con
        el índice: en el pie y en la ficha misma.
      */}
      <p className="entradilla">
        Un directorio de los sitios que están ayudando tras el sismo.
      </p>

      {/*
        La promesa, antes del índice: promete lo revisado, no «todo» (RF-34).

        Se retiró el 14-ago-2026 el conteo de temas sin fuentes: no hacía falta
        anunciarlo arriba porque la sección vacía se pinta igual, más abajo, con
        su nombre y su nota (RF-35). Lo demás se queda — la antigüedad de la
        revisión es la señal de confianza de este directorio, y el aviso de
        fichas vencidas es la única parte que dice algo malo de nosotros, que es
        justo lo que RF-34 pide que no se esconda.
      */}
      <section className="estado" aria-label="Estado del directorio">
        {inventario.total === 0 ? (
          <>
            <p className="estado__cifra">Todavía no hay fuentes cargadas</p>
            <p className="estado__detalle">
              Estamos comprobando una por una antes de publicarlas. Preferimos una lista
              corta que se sostenga a una larga que mande a nadie al sitio equivocado.
            </p>
          </>
        ) : (
          <>
            <p className="estado__cifra">
              {plural(inventario.total, 'fuente revisada', 'fuentes revisadas')}
            </p>
            <p className="estado__detalle">
              La más reciente, {haceCuanto(inventario.masReciente!)}. La más antigua,{' '}
              {haceCuanto(inventario.masAntigua!)}.
            </p>
            {inventario.vencidas > 0 && (
              <p className="estado__detalle estado__falta">
                {plural(inventario.vencidas, 'fuente lleva', 'fuentes llevan')} más de una
                semana sin revisar. {inventario.vencidas === 1 ? 'Está marcada' : 'Están marcadas'}
                {' '}en su ficha.
              </p>
            )}
          </>
        )}
      </section>

      {/*
        El índice no es una comodidad: con ~30 fichas la página pasa de 12.000
        px, y el buscador y los filtros están descartados por sobreingeniería.
        Esto, el regreso de cada sección y el compartir por sección son toda la
        navegación del directorio (RF-32).
      */}
      <h2 className="indice__titulo" id="temas">Ir a un tema</h2>
      <ul className="indice">
        {TEMAS.map((t) => {
          const cuantas = porTema(t.id).length;
          return (
            <li key={t.id}>
              <a className={`i-${t.id}`} href={`#${t.id}`}>
                {t.corto}
                <span className={`indice__conteo${cuantas === 0 ? ' indice__conteo--cero' : ''}`}>
                  {cuantas === 0 ? 'Sin fuentes' : plural(cuantas, 'fuente', 'fuentes')}
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      {TEMAS.map((t) => {
        const fichas = porTema(t.id);
        return (
          <section className={`seccion s-${t.id}`} id={t.id} key={t.id}>
            <div className="seccion__cabecera">
              <h2>{t.nombre}</h2>
              <p className="seccion__pie">
                <span>
                  {fichas.length === 0
                    ? 'Sin fuentes todavía'
                    : plural(fichas.length, 'fuente', 'fuentes')}
                </span>
                {/*
                  Ancla pura: compartir solo esta parte por WhatsApp tiene que
                  funcionar sin JavaScript (RF-36).
                */}
                <a className="seccion__compartir" href={`#${t.id}`}>
                  Compartir esta sección
                </a>
              </p>
            </div>

            {fichas.length > 0 ? (
              <ul className="fichas">
                {fichas.map((f) => <Ficha key={f.id} fuente={f} hoy={hoy} />)}
              </ul>
            ) : (
              <SinFichas tema={t.id} />
            )}

            {/* Sin esto, quien llega al fondo de una sección no puede cambiar de tema. */}
            <a className="seccion__volver" href="#temas">
              <span aria-hidden="true">↑</span> Ir a otro tema
            </a>
          </section>
        );
      })}

      <section className="aportar">
        <h2>¿Conoces una fuente que falta?</h2>
        <p>
          Escríbenos y la revisamos. No publicamos ofertas de particulares ni datos de
          contacto de personas: solo fuentes que se mantienen en el tiempo.
        </p>
        {/*
          Aquí se listan sitios de otra gente sin pedirles permiso, que es lo
          correcto para un directorio pero deja una puerta que hay que abrir:
          quien está en la lista tiene que poder corregir lo que decimos de él
          —o salirse— sin buscar a nadie.
        */}
        <p>
          ¿Alguno de estos enlaces es tuyo, o debería estar y no está? Escríbenos: te
          corregimos lo que digamos de él, o lo sacamos.
        </p>
        <div className="aportar__vias">
          <a className="aportar__via" href={`mailto:${CONTACTO}`}>
            Escribir a {CONTACTO}
          </a>
          {MENSAJES_DIRECTOS.map(({ red, href }) => (
            <a className="aportar__via" key={red} href={href} rel="noopener">
              Mensaje directo en {red}
              <span className="canal__flecha" aria-hidden="true">↗</span>
              <span className="oculto">Se abre en otro sitio</span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
