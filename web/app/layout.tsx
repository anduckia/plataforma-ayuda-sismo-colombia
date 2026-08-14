import type { Metadata, Viewport } from 'next';
import { CONTACTO, MENSAJES_DIRECTOS } from '@/lib/contacto';
import { DESCRIPCION, NOMBRE, SITIO } from '@/lib/sitio';
import './globals.css';

export const metadata: Metadata = {
  /*
    Sin esto, Next resuelve las URL de Open Graph contra `localhost` y la vista
    previa de WhatsApp sale rota en producción. Es el requisito de todo lo demás.
  */
  metadataBase: new URL(SITIO),

  title: {
    default: `${NOMBRE} — directorio de ayuda tras el sismo`,
    /*
      Las páginas hijas ponen solo su nombre. El sufijo importa: quien ve el
      resultado en Google lee primero de qué sitio es, y en un contexto donde la
      suplantación es rutinaria eso es la mitad de la decisión de tocar.
    */
    template: `%s — ${NOMBRE}`,
  },
  description: DESCRIPCION,

  /*
    T-067 · Revertido el 14-ago-2026, con la condición previa de RF-38 confirmada
    por el equipo: retirados el mapa y los formularios (RF-37), la cara pública
    solo sirve organizaciones, sus canales y sus líneas institucionales. Ninguna
    persona identificable. Iban tres piezas juntas —esta, `robots.ts` y la
    cabecera `X-Robots-Tag` de `next.config.mjs`— y se levantaron las tres.
  */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Sin recortes en el fragmento: la promesa del sitio está en la primera
      // frase, y un fragmento truncado la convierte en otra cosa.
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },

  /*
    El canonical NO va aquí: la metadata del layout la heredan todas las
    páginas, y un `canonical: '/'` global le diría a Google que /privacidad es
    una copia de la portada y no debe indexarse. Cada página declara el suyo.
  */

  /*
    Este sitio se difunde por WhatsApp: la vista previa del enlace no es un
    adorno, es la portada real para la mayoría de quienes lo reciben. Un enlace
    pelado en un grupo de vecinos no lo abre nadie.
  */
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: SITIO,
    siteName: NOMBRE,
    title: `${NOMBRE} — directorio de ayuda tras el sismo`,
    description: DESCRIPCION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${NOMBRE} — directorio de ayuda tras el sismo`,
    description: DESCRIPCION,
  },

  // Que el buscador sepa que esto no es una empresa que vende nada.
  applicationName: NOMBRE,
  authors: [{ name: NOMBRE }],
  creator: NOMBRE,
  publisher: NOMBRE,
  category: 'Emergencias',
  formatDetection: { telephone: true, email: false, address: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#141210',
};

/**
 * Quiénes somos y qué es esto, en el formato que leen las máquinas.
 *
 * Va en el layout y no en la portada porque describe al SITIO, no a la página.
 * `NGO` en vez de `Organization`: es lo que más se acerca a una iniciativa
 * ciudadana sin ánimo de lucro, y de paso deja dicho en el grafo lo que el pie
 * declara en castellano — que aquí no se maneja dinero.
 *
 * La CSP permite esto: `script-src` lleva `'unsafe-inline'` por la hidratación
 * de Next, y en todo caso `application/ld+json` no se ejecuta.
 */
const DATOS_DEL_SITIO = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'NGO',
      '@id': `${SITIO}/#organizacion`,
      name: NOMBRE,
      description:
        'Iniciativa ciudadana que mantiene un directorio revisado de fuentes de ' +
        'ayuda tras el sismo en Colombia. Complementa a los organismos de socorro; ' +
        'no los reemplaza. No pide, no recibe y no maneja dinero.',
      url: SITIO,
      email: CONTACTO,
      areaServed: { '@type': 'Country', name: 'Colombia' },
      sameAs: MENSAJES_DIRECTOS.map(({ href }) => href),
    },
    {
      '@type': 'WebSite',
      '@id': `${SITIO}/#sitio`,
      url: SITIO,
      name: NOMBRE,
      description: DESCRIPCION,
      inLanguage: 'es-CO',
      publisher: { '@id': `${SITIO}/#organizacion` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /*
      `es-CO` y no `es` a secas: el sitio habla de municipios colombianos, líneas
      colombianas y una emergencia colombiana. Es una señal barata y exacta.
    */
    <html lang="es-CO">
      <body>
        <script
          type="application/ld+json"
          // Contenido propio y constante, no entra nada de fuera.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(DATOS_DEL_SITIO) }}
        />
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
