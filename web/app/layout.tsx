import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SOS Sismo Colombia — pide ayuda o busca a un familiar',
  description:
    'Publica tu solicitud para que la ayuda te encuentre. Tu teléfono y tu dirección exacta ' +
    'nunca son públicos. Es gratuito y no necesitas crear una cuenta.',
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
        <main id="principal" className="envoltura">{children}</main>
      </body>
    </html>
  );
}
