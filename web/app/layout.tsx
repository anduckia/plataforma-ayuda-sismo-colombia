import type { Metadata, Viewport } from 'next';
import { CONTACTO } from '@/lib/contacto';
import './globals.css';

export const metadata: Metadata = {
  title: 'SOS Sismo Colombia — dónde está cada cosa',
  description:
    'Directorio de fuentes sobre el sismo: voluntariado, centros de acopio, donaciones, ' +
    'búsqueda de personas, vías y canales oficiales. Cada fuente dice quién la hace y ' +
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
          Decisión del equipo del 14-ago-2026: la banda de cabecera deja de ser
          el aviso de la 123 y pasa a ser la puerta de quien está listado. El
          producto ya no recibe solicitudes —no hay formulario donde alguien en
          peligro se quede escribiendo— y sí publica los enlaces de terceros,
          que es la deuda que quedaba sin dirección visible.

          El aviso de la 123 NO desaparece del sitio: sigue en las URLs
          retiradas de los formularios (`components/Retirado`), que es donde
          llega quien viene de WhatsApp o de la radio esperando pedir auxilio.
          RNF-06 quedó actualizado en `specs/01-requirements.md` para que diga
          esto y no lo que la página hacía antes (P8).
        */}
        <p className="aviso-enlaces">
          ¿Alguno de estos enlaces es tuyo, o quieres aparecer? Escríbenos a{' '}
          <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a>.
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
          {/*
            Aquí iba «Hay réplicas: si tu casa está dañada, no vuelvas a entrar».
            Retirada el 14-ago-2026 por decisión del equipo. Era consejo de
            seguridad de fase aguda y este sitio ya no da consejo: enlaza a
            quien lo da. Lo equivalente vive ahora en la ficha de la Defensoría
            («qué hacer y qué no») y en la de evaluación estructural, que es la
            que de verdad puede decirle a alguien si su casa se puede habitar.
          */}
          <p><a href="/privacidad">Privacidad</a></p>
        </footer>
      </body>
    </html>
  );
}
