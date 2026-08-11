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
  return f ? { title: `${f.titulo} — SOS Sismo Colombia` } : {};
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

      <div className="aviso aviso--privacidad">
        <p>
          Lo que marques con 🔒 <strong>no se publica</strong>: solo lo ven los ayudantes que
          el equipo verificó por teléfono, uno por uno.
        </p>
      </div>

      <Formulario encuesta={encuesta} />

      <p className="pie">
        <a href="/">Volver al inicio</a>
      </p>
    </>
  );
}
