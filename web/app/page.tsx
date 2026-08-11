import Frescura from '@/components/Frescura';
import { FORMULARIOS } from '@/lib/ushahidi';

const SMS = process.env.NEXT_PUBLIC_SMS?.trim();

export default function Inicio() {
  return (
    <>
      <h1>¿Qué necesitas hacer?</h1>
      <p className="entradilla">
        Elige una opción. Es gratis y no hace falta crear una cuenta.
      </p>

      {/* RF-24: se busca la fecha él solo tras pintar, para no meter una
          llamada de red en el camino crítico de la página más visitada. */}
      <Frescura />

      <nav className="vias" aria-label="Qué quieres hacer">
        {(Object.keys(FORMULARIOS) as (keyof typeof FORMULARIOS)[]).map((slug) => {
          const f = FORMULARIOS[slug];
          return (
            <a key={slug} className={`via via--${f.tono}`} href={`/${slug}`}>
              <span className="via__titulo">{f.titulo}</span>
              <span className="via__desc">{f.descripcion}</span>
              <span className="via__meta">{f.visibilidad}</span>
            </a>
          );
        })}
      </nav>

      <div className="aviso aviso--privacidad">
        <p className="aviso__titulo">Tu teléfono y tu dirección no se publican</p>
        <p>
          Solo los ven los ayudantes que el equipo verificó uno por uno, por teléfono.
        </p>
        <p>
          <strong>Nunca te pediremos dinero, claves ni números de cuenta.</strong> Si alguien
          lo hace en nombre de este sitio, es un fraude.
        </p>
      </div>

      {SMS && (
        <div className="aviso">
          <p className="aviso__titulo">¿Sin internet?</p>
          <p style={{ marginBottom: 0 }}>
            Manda un SMS al <strong>{SMS}</strong> así:<br />
            <strong>AYUDA</strong> + qué necesitas + cuántas personas son + municipio y barrio.
          </p>
        </div>
      )}

      {/*
        El pie era una lista de cuatro avisos sin relación entre sí. Se queda lo
        que solo se puede decir aquí: qué es este sitio, y el riesgo de réplicas
        —lo de la Cruz Roja ya encabeza «Busco a un familiar», que es donde le
        sirve a quien lo necesita.
      */}
      <p className="pie">
        Somos una plataforma ciudadana: <strong>sumamos visibilidad a los organismos de
        socorro, no los reemplazamos</strong>. Y hay réplicas: si tu casa quedó dañada, no
        vuelvas a entrar. · <a href="/enlaces-oficiales">Todos los canales oficiales</a>
      </p>
    </>
  );
}
