import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SOS Sismo Colombia — dónde está cada cosa',
  description:
    'Directorio de fuentes sobre el sismo: albergues, ayuda humanitaria, búsqueda de ' +
    'personas, voluntariado, vías y canales oficiales. Cada fuente dice quién la hace y ' +
    'cuándo se revisó por última vez.',
  /*
    T-067 · Sigue pidiendo no indexar, y es a propósito.
    RF-38 revierte esto, pero solo DESPUÉS de que una persona confirme que la
    cara pública ya no sirve ningún dato personal. El motivo original (RF-19)
    era el mapa, que publicaba nombres de personas desaparecidas, incluidos
    menores; el mapa ya no está, así que la condición está cumplida de hecho.
    Falta la confirmación humana, no el código: cambiar `index` a true y borrar
    la regla de `robots.ts` es todo lo que queda.
  */
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
          </div>
        </header>
        {/*
          RNF-06: va antes que cualquier otra cosa y en todas las páginas.
          Esta plataforma complementa a los organismos de socorro; quien tiene
          una vida en riesgo delante no debería estar leyendo un directorio.
          El número es un enlace `tel:` para que se marque de un toque.
        */}
        <p className="linea123">
          ¿Hay una vida en riesgo <strong>ahora</strong>? Llama primero a{' '}
          <a href="tel:123">la línea de emergencias <strong>123</strong></a>.
        </p>
        <main id="principal" className="envoltura">{children}</main>
        <footer className="envoltura pie">
          <p>
            Esta plataforma es ciudadana y{' '}
            <strong>complementa a los organismos de socorro</strong>: suma visibilidad, no
            los reemplaza. Enlazamos a otras fuentes; no respondemos por lo que publiquen
            ni recogemos datos de nadie.
          </p>
          {/* P6 · La declaración es la vacuna contra la estafa post-desastre. */}
          <p>
            <strong>No pedimos, no recibimos y no manejamos dinero.</strong> Si alguien te
            lo pide en nombre de este sitio, es un fraude.
          </p>
          <p>Hay réplicas: si tu casa está dañada, no vuelvas a entrar.</p>
          <p><a href="/privacidad">Privacidad</a></p>
        </footer>
      </body>
    </html>
  );
}
