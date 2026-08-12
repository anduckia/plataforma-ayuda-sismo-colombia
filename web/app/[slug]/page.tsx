import { notFound } from 'next/navigation';
import Formulario from '@/components/Formulario';
import { FORMULARIOS, traerEncuesta, type Slug } from '@/lib/ushahidi';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return Object.keys(FORMULARIOS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = FORMULARIOS[slug as Slug];
  // RF-15: cada página con su propia descripción. Compartiendo las cuatro URLs
  // por WhatsApp, todas se veían antes con el resumen de «Pido ayuda».
  return f ? { title: `${f.titulo} — SOS Sismo Colombia`, description: f.meta } : {};
}

/**
 * Lo que hay que entender ANTES de llenar el formulario. «Quiero ayudar» pide
 * seis datos personales sin decir para qué; «Ofrezco recursos» puede acabar
 * mandando una máquina a un punto de rescate.
 */
function Proposito({ slug }: { slug: Slug }) {
  if (slug === 'quiero-ayudar') {
    return (
      <div className="aviso">
        <p className="aviso__titulo">Para qué es este formulario</p>
        <p>
          Es la entrada al <strong>equipo verificado</strong>. Al enviarlo, el equipo{' '}
          <strong>te llama</strong> para confirmar quién eres. Solo después verás los
          teléfonos y las direcciones de quienes piden ayuda.
        </p>
        <p style={{ marginBottom: 0 }}>
          ¿Lo que ofreces es maquinaria, plantas eléctricas o luces? Usa{' '}
          <a href="/ofrezco-recursos">Ofrezco recursos</a>.
        </p>
      </div>
    );
  }

  // T-039: encabeza con lo oficial, pero NO redirige. `/busco-familiar` sigue
  // activo: mandar a alguien a un canal saturado y cerrarle este de paso sería
  // peor que duplicar el registro (RF-25).
  if (slug === 'busco-familiar') {
    return (
      <div className="aviso">
        <p className="aviso__titulo">Empieza por la Cruz Roja</p>
        {/*
          El correo y el WhatsApp del RCF estaban escritos aquí; salieron el
          12-ago-2026 (RF-25, ADR-022). Los mantiene la Cruz Roja en su página,
          que es quien responde por ellos; nosotros no íbamos a enterarnos el
          día que cambiaran. Su línea nacional, el 132, no caduca y sigue en el
          bloque de emergencia del pie.
        */}
        <p>
          Su programa de <strong>Restablecimiento del Contacto entre Familiares</strong> es el
          que más alcance tiene y el único que conecta con la red internacional. Escríbeles
          desde{' '}
          <a href="https://ayuda.cruzrojacolombiana.org/" target="_blank" rel="noopener noreferrer">
          su página de ayuda</a>, donde está el contacto al día, y registra el caso en el{' '}
          <a href="https://www.medicinalegal.gov.co/" target="_blank" rel="noopener noreferrer">
          Registro Nacional de Desaparecidos</a>.
        </p>
        <p style={{ marginBottom: 0 }}>
          Y después publícalo aquí, para que más ojos lo busquen. Lo de abajo no reemplaza a
          lo de arriba. · <a href="/enlaces-oficiales#familiares">Ver todos los canales</a>
        </p>
      </div>
    );
  }

  // T-040: quien reporta daño estructural sin emergencia vital no necesita un
  // rescate, necesita un ingeniero. Esta salida va antes del formulario.
  if (slug === 'pido-ayuda') {
    return (
      <div className="aviso">
        <p className="aviso__titulo">¿Solo quedó dañada tu casa?</p>
        <p style={{ marginBottom: 0 }}>
          Si <strong>no hay nadie en peligro</strong>, en{' '}
          <a href="https://sismoayudaco.com/reportar" target="_blank" rel="noopener noreferrer">
          SismoAyuda</a> subes fotos y unos ingenieros voluntarios te mandan por correo un
          informe de si es habitable. Si hay alguien dentro o riesgo de colapso, llama al{' '}
          <a href="tel:123"><strong>123</strong></a> y publica aquí. ·{' '}
          <a href="/enlaces-oficiales#vivienda">Más canales</a>
        </p>
      </div>
    );
  }

  if (slug === 'ofrezco-recursos') {
    return (
      <div className="aviso aviso--error">
        <p className="aviso__titulo">La maquinaria no entra por su cuenta</p>
        <p>
          Una máquina solo entra a un punto de rescate{' '}
          <strong>cuando lo pide un organismo de socorro</strong>. Mover escombros por
          iniciativa propia puede aplastar la bolsa de aire donde alguien respira.
        </p>
        <p style={{ marginBottom: 0 }}>
          Registra aquí tu recurso y espera a que el equipo te llame para asignarte.
        </p>
      </div>
    );
  }

  return null;
}

export default async function PaginaFormulario({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ficha = FORMULARIOS[slug as Slug];
  if (!ficha) notFound();

  let encuesta;
  try {
    encuesta = await traerEncuesta(slug as Slug);
  } catch {
    return (
      <>
        <h1>{ficha.titulo}</h1>
        <div className="aviso aviso--error" role="alert">
          <p className="aviso__titulo">No pudimos cargar el formulario</p>
          <p>
            La plataforma no responde en este momento. Vuelve a intentarlo en unos minutos.
            Si hay vidas en riesgo inmediato, llama al <strong>123</strong>.
          </p>
        </div>
        <p><a href="/">Volver al inicio</a></p>
      </>
    );
  }

  return (
    <>
      <h1>{ficha.titulo}</h1>
      <p className="entradilla">{ficha.gancho}. Los campos con * son obligatorios.</p>

      <Proposito slug={slug as Slug} />

      <div className="aviso aviso--privacidad">
        <p>
          Lo que lleva 🔒 <strong>no se publica</strong>: solo lo ven los ayudantes que el
          equipo verificó por teléfono, uno por uno.
        </p>
      </div>

      <Formulario encuesta={encuesta} slug={slug as Slug} />

      <p className="pie">
        <a href="/">Volver al inicio</a>
      </p>
    </>
  );
}
