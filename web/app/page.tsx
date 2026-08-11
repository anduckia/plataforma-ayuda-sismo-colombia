import { FORMULARIOS } from '@/lib/ushahidi';

const SMS = process.env.NEXT_PUBLIC_SMS?.trim();

export default function Inicio() {
  return (
    <>
      <h1>¿Qué necesitas hacer?</h1>
      <p className="entradilla">
        Elige una opción. No necesitas crear una cuenta y no cuesta nada.
      </p>

      <nav className="vias" aria-label="Qué quieres hacer">
        {(Object.keys(FORMULARIOS) as (keyof typeof FORMULARIOS)[]).map((slug) => {
          const f = FORMULARIOS[slug];
          return (
            <a key={slug} className={`via via--${f.tono}`} href={`/${slug}`}>
              <span className="via__titulo">{f.titulo}</span>
              <span className="via__desc">{f.descripcion}</span>
              <span className="via__meta" style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.4rem', display: 'block' }}>
                {f.visibilidad}
              </span>
            </a>
          );
        })}
      </nav>

      <div className="aviso aviso--privacidad">
        <p className="aviso__titulo">Tus datos de contacto no se publican</p>
        <p>
          Tu teléfono y tu dirección exacta <strong>nunca son públicos</strong>: solo los ven
          los ayudantes que el equipo verificó uno por uno, por teléfono.
        </p>
        <p>
          <strong>Nunca te pediremos dinero, claves ni números de cuenta.</strong> Si alguien
          lo hace en nombre de este sitio, es un fraude.
        </p>
      </div>

      {SMS && (
        <div className="aviso">
          <p className="aviso__titulo">¿Sin internet?</p>
          <p>
            Envía un SMS al <strong>{SMS}</strong> con: AYUDA + qué necesitas + cuántas
            personas son + municipio y barrio.
          </p>
        </div>
      )}

      <p className="pie">
        Esta plataforma es ciudadana y <strong>complementa a los organismos de socorro</strong>:
        suma visibilidad, no los reemplaza. Para personas desaparecidas, registra el caso
        además en la Cruz Roja Colombiana. Hay réplicas: si tu casa está dañada, no vuelvas
        a entrar.
      </p>
    </>
  );
}
