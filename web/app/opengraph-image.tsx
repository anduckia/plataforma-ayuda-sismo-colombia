import { ImageResponse } from 'next/og';
import { NOMBRE } from '@/lib/sitio';

/**
 * La vista previa del enlace (RF-38).
 *
 * Este sitio se reenvía por WhatsApp, y ahí un enlace sin imagen es una línea
 * azul que nadie toca en un grupo con cien mensajes. La tarjeta es, para la
 * mayoría de quienes lo reciben, la única portada que van a ver.
 *
 * Se genera aquí en vez de subir un PNG por dos razones: el texto queda en el
 * repositorio —se corrige como código, no reabriendo un editor de imágenes— y
 * no hay que servir un binario desde un sitio que presume de no servir
 * imágenes. Next la construye una vez en compilación.
 *
 * Sin webfont a propósito, igual que la página: `next/og` trae su tipografía
 * por defecto y no hace falta más para cinco palabras.
 */
export const alt = 'SOS Sismo Colombia — directorio de ayuda tras el sismo';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Imagen() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#ffffff',
          // La franja roja es la misma señalética de emergencia de la página:
          // se reconoce en miniatura, que es como se ve en un chat.
          borderTop: '24px solid #C1121F',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: '#C1121F',
            }}
          >
            {NOMBRE}
          </div>
          <div
            style={{
              fontSize: 82,
              fontWeight: 800,
              lineHeight: 1.1,
              color: '#141210',
              marginTop: 28,
            }}
          >
            ¿Dónde está cada cosa tras el sismo?
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 36, color: '#4A453E', lineHeight: 1.35 }}>
            Voluntariado · Acopio · Donaciones · Búsqueda de personas · Vías ·
            Info oficial
          </div>
          {/* Lo que separa esto de una lista de enlaces cualquiera. */}
          <div style={{ fontSize: 30, color: '#4A453E', marginTop: 18 }}>
            Cada fuente dice quién la hace y cuándo se revisó.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
