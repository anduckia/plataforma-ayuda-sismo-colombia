import type { Metadata, Viewport } from 'next';
import LineasEmergencia from '@/components/LineasEmergencia';
import PieLineas from '@/components/PieLineas';
import './globals.css';

const TITULO = 'SOS Sismo Colombia — pide ayuda o busca a un familiar';
const DESCRIPCION =
  'Publica tu solicitud para que la ayuda te encuentre. Tu teléfono y tu dirección exacta ' +
  'nunca son públicos. Es gratuito y no necesitas crear una cuenta.';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.sossismocolombia.com.co'),
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: '/' },
  // RF-19 (revisado): indexación selectiva. Esta página no muestra datos de
  // nadie, así que es indexable por defecto; /mapa anula esto en su propia
  // metadata porque sí lleva nombres y ubicaciones reales.
  //
  // El Open Graph/Twitter es aparte: sirve para que el enlace se vea con
  // imagen y texto al reenviarse por WhatsApp, el canal real de difusión
  // (ver docs/guia-lanzamiento.md), indexado o no.
  openGraph: {
    title: TITULO,
    description: DESCRIPCION,
    url: '/',
    siteName: 'SOS Sismo Colombia',
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITULO,
    description: DESCRIPCION,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#141210',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <a className="saltar" href="#principal">Saltar al contenido</a>
        <header className="barra">
          <div className="barra__interior">
            <a className="barra__marca" href="/">SOS Sismo Colombia</a>
            <a className="barra__enlace" href="/mapa">Ver el mapa</a>
          </div>
        </header>
        {/*
          RNF-06: va antes que cualquier formulario y en todas las páginas.
          Esta plataforma complementa a los organismos de socorro; quien tiene
          una vida en riesgo delante no debería estar llenando un formulario.
          El número es un enlace `tel:` para que se marque de un toque.
        */}
        <p className="linea123">
          <span aria-hidden="true">⚠️ </span>
          ¿Hay una vida en riesgo <strong>ahora</strong>? Llama primero a{' '}
          <a href="tel:123">la línea de emergencias <strong>123</strong></a>.
        </p>
        <main id="principal" className="envoltura">{children}</main>
        {/*
          RF-25 (T-038): las líneas van en el pie, no arriba. Arriba está el 123
          y solo el 123 (RNF-06); apilar siete números sobre el formulario lo
          echa fuera de la pantalla de un móvil justo cuando alguien intenta
          pedir ayuda.
        */}
        <footer className="envoltura">
          <PieLineas><LineasEmergencia compacto /></PieLineas>
          <p className="pie">
            <a href="/enlaces-oficiales">Canales oficiales</a> ·{' '}
            <a href="/privacidad">Privacidad y borrado de datos</a>
          </p>
        </footer>
      </body>
    </html>
  );
}
