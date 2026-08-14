import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Retirado from '@/components/Retirado';

/**
 * Los cuatro formularios retirados (RF-37).
 *
 * Estas URLs se dictaron por radio y circularon por WhatsApp durante los
 * primeros días, así que siguen vivas explicando el cambio. Cualquier otra
 * ruta sí es un 404 de verdad: esta página es dinámica y sin la lista
 * respondería a `/loquesea` con un aviso que no viene a cuento.
 */
const RETIRADOS: Record<string, string> = {
  'pido-ayuda': 'El formulario para pedir ayuda',
  'busco-familiar': 'El formulario para buscar a un familiar',
  'quiero-ayudar': 'El registro de voluntarios',
  'ofrezco-recursos': 'El registro de recursos',
};

export function generateStaticParams() {
  return Object.keys(RETIRADOS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const que = RETIRADOS[slug];
  if (!que) return {};
  return {
    title: `${que} ya no está`,
    description:
      'Este sitio dejó de recibir solicitudes y ahora es un directorio de fuentes sobre ' +
      'el sismo. Aquí están los sitios que sí reciben.',
    alternates: { canonical: `/${slug}` },
    // Mismo motivo que en `/mapa`: contenido delgado y casi idéntico entre las
    // cinco URLs retiradas. Se sigue, no se indexa (RF-38).
    robots: { index: false, follow: true },
  };
}

export default async function PaginaRetirada({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const que = RETIRADOS[slug];
  if (!que) notFound();
  return <Retirado que={que} />;
}
