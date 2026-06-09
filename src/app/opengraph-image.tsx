// Imagen Open Graph estática del home y secciones genéricas.

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt    = 'Liga Metropolitana Eje Este';
export const size   = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgHome() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(135deg, #020c1b 0%, #0d1f4a 100%)',
        color: 'white', fontFamily: 'system-ui, sans-serif',
        display: 'flex', flexDirection: 'column',
        padding: 80, justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{
            width: 90, height: 90, borderRadius: 999,
            background: '#1e3a8a', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 34, fontWeight: 900,
          }}>LM</div>
          <div style={{
            background: '#f97316', color: 'white',
            padding: '8px 18px', borderRadius: 999,
            fontSize: 20, fontWeight: 900, letterSpacing: 2,
          }}>
            TEMPORADA 2026
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 90, fontWeight: 900, lineHeight: 1, letterSpacing: -2 }}>Liga Metropolitana</span>
          <span style={{ fontSize: 90, fontWeight: 900, color: '#f97316', lineHeight: 1, marginTop: 8, letterSpacing: -2 }}>Eje Este</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <span style={{ fontSize: 26, color: '#94a3b8', maxWidth: 700, lineHeight: 1.3 }}>
            Resultados en vivo, calendario, estadísticas y noticias de todas las categorías
          </span>
          <span style={{ fontSize: 18, color: '#64748b' }}>liga-metropolitana-web.vercel.app</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
