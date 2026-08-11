import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SOS Sismo Colombia — pide ayuda o busca a un familiar',
  description:
    'Publica tu solicitud para que la ayuda te encuentre. Tu teléfono y tu dirección exacta ' +
    'nunca son públicos. Es gratuito y no necesitas crear una cuenta.',
  // RF-19: además de robots.txt, la cabecera en cada página. El archivo pide
  // no rastrear; esto pide no indexar, que no es lo mismo: una URL compartida
  // por WhatsApp puede acabar indexada sin que nadie rastree el sitio.
  robots: { index: false, follow: false },
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
        <footer className="envoltura pie">
          <a href="/privacidad">Privacidad y borrado de datos</a>
        </footer>
      </body>
    </html>
  );
}
