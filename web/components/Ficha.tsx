import {
  destinoDe, nombreDelTipo, ordenarCanales, type Canal, type Fuente,
} from '@/lib/fuentes';
import { estadoDeRevision } from '@/lib/fecha';

/**
 * Marca de que el enlace sale del sitio. La flecha es decorativa —el lector
 * ya está viendo el dominio— así que el aviso real va en texto para quien
 * navega con lector de pantalla.
 */
function Fuera() {
  return (
    <>
      <span className="canal__flecha" aria-hidden="true">↗</span>
      <span className="oculto">Se abre en otro sitio</span>
    </>
  );
}

function CanalSecundario({ canal }: { canal: Canal }) {
  const { href, texto } = destinoDe(canal);
  return (
    <a className="canal-otro" href={href} rel="noopener nofollow">
      {nombreDelTipo(canal.tipo)} · {texto}
      <Fuera />
    </a>
  );
}

/**
 * La ficha, con la anatomía de RF-33: siempre estos siete elementos, siempre
 * en este orden. La consistencia ES el diseño — quince fichas que contestan lo
 * mismo en el mismo orden se leen como trabajo serio.
 *
 * La ficha entera NO es un enlace: con hasta tres canales, el destino de un
 * toque en cualquier parte sería ambiguo.
 */
export default function Ficha({ fuente, hoy }: { fuente: Fuente; hoy: string }) {
  const principal = destinoDe(fuente.principal);
  const revision = estadoDeRevision(fuente.revisado, hoy);
  const otros = ordenarCanales(fuente.otros ?? []);

  return (
    <li className="ficha" id={fuente.id}>
      {/* 1 y 2 — nombre y tipo. El tipo cae a la misma línea si cabe. */}
      <div className="ficha__encabezado">
        <span className="ficha__nombre">{fuente.nombre}</span>
        <span className="tipo">{nombreDelTipo(fuente.principal.tipo)}</span>
      </div>

      {/* 3 — quién la hace */}
      <p className="ficha__quien">{fuente.quien}</p>

      {/* 4 — qué encuentras ahí */}
      <p className="ficha__que">{fuente.que}</p>

      {/*
        5 y 6 — zona y fecha comparten renglón. El orden se conserva porque se
        leen de izquierda a derecha, y juntar los dos datos apagados en una
        sola línea es lo que impide que la fecha domine (RF-34).
      */}
      <p className="ficha__meta">
        {fuente.zona && (
          <>
            {fuente.zona}
            <span className="sep" aria-hidden="true"> · </span>
          </>
        )}
        <time
          dateTime={fuente.revisado}
          className={revision.alerta ? 'fecha--vieja' : undefined}
        >
          {revision.texto}
        </time>
      </p>

      {/* 7 — el canal muestra el destino, nunca «ver más» */}
      <a className="canal" href={principal.href} rel="noopener nofollow">
        <span>{principal.texto}</span>
        <Fuera />
      </a>

      {otros.length > 0 && (
        <div className="canales-otros">
          {otros.map((c) => (
            <CanalSecundario key={`${c.tipo}-${destinoDe(c).href}`} canal={c} />
          ))}
        </div>
      )}
    </li>
  );
}
