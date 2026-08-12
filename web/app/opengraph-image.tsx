import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'SOS Sismo Colombia';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: '#141210',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', width: 64, height: 8, background: '#C1121F', marginBottom: 40 }} />
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
          SOS Sismo Colombia
        </div>
        <div style={{ display: 'flex', fontSize: 34, color: '#D6D1C8', marginTop: 24, maxWidth: 900 }}>
          Pide ayuda o busca a un familiar. Gratis, sin cuenta.
        </div>
      </div>
    ),
    { ...size },
  );
}
