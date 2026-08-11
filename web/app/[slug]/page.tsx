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
          Es la puerta de entrada al <strong>equipo verificado</strong>. Cuando lo envíes, el
          equipo <strong>te llamará</strong> para confirmar quién eres y con qué organización
          vienes. Solo después tendrás acceso a los teléfonos y las direcciones de quienes
          piden ayuda.
        </p>
        <p>
          <strong>No necesitas crear ninguna cuenta.</strong> Si lo que quieres es ofrecer
          maquinaria, plantas eléctricas o luces, usa{' '}
          <a href="/ofrezco-recursos">Ofrezco recursos</a>.
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
          <strong>cuando un organismo de socorro lo pide</strong>. Mover escombros por
          iniciativa propia puede aplastar la bolsa de aire donde alguien está respirando.
        </p>
        <p>Registra aquí tu recurso y espera a que el equipo te llame para asignarte.</p>
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
          Lo que marques con 🔒 <strong>no se publica</strong>: solo lo ven los ayudantes que
          el equipo verificó por teléfono, uno por uno.
        </p>
      </div>

      <Formulario encuesta={encuesta} slug={slug as Slug} />

      <p className="pie">
        <a href="/">Volver al inicio</a>
      </p>
    </>
  );
}
