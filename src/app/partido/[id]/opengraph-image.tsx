// Imagen Open Graph dinámica para cada partido.
// URL: /partido/[id]/opengraph-image?categoria=U16M
// Se renderiza al momento, dura 60s en caché.

import { ImageResponse } from 'next/og';
import { CATEGORIAS, type CategoriaId } from '@/lib/categorias';
import { getPartidoById } from '@/lib/queries';

export const runtime = 'edge';
export const alt    = 'Marcador del partido';
export const size   = { width: 1200, height: 630 };
export const contentType = 'image/png';

const CAT_LABELS: Record<string, string> = {
  INTERINDUSTRIAL: 'INTERINDUSTRIAL',
  U16_FEMENINO:    'U16 FEMENINO',
  U16M:            'U16M',
  MASTER40:        'MASTER 40',
  LIBRE:           'LIBRE',
};

export default async function OgPartido({
  params, searchParams,
}: {
  params: { id: string };
  searchParams?: { categoria?: string };
}) {
  // Por convención los OG en Next 14 no reciben searchParams directos.
  // Para mantenerlo simple, intentamos todas las categorías hasta encontrar el partido.
  let partido = null;
  let categoria: CategoriaId | null = null;
  for (const cat of CATEGORIAS) {
    const p = await getPartidoById(cat.id, params.id);
    if (p) { partido = p; categoria = cat.id; break; }
  }

  if (!partido || !categoria) {
    return new ImageResponse(
      (
        <div style={{
          width: '100%', height: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: '#0d1f4a', color: 'white', fontSize: 60, fontWeight: 900,
        }}>
          Liga Metropolitana Eje Este
        </div>
      ),
      { ...size }
    );
  }

  const local = partido.equipoLocalNombre     ?? 'Local';
  const visit = partido.equipoVisitanteNombre ?? 'Visitante';
  const ml = partido.marcadorLocal     ?? 0;
  const mv = partido.marcadorVisitante ?? 0;
  const isLive  = partido.enVivo === true && partido.estatus !== 'finalizado';
  const isFinal = partido.estatus === 'finalizado';
  const stateLabel = isLive ? 'EN VIVO' : isFinal ? 'FINAL' : 'PRÓXIMAMENTE';
  const stateColor = isLive ? '#ef4444' : isFinal ? '#10b981' : '#94a3b8';

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(135deg, #020c1b 0%, #0d1f4a 100%)',
        color: 'white', fontFamily: 'system-ui, sans-serif', padding: '60px 80px',
        justifyContent: 'space-between',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
              width: 70, height: 70, borderRadius: 999,
              background: '#1e3a8a', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 900,
            }}>LM</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#cbd5e1' }}>Liga Metropolitana</span>
              <span style={{ fontSize: 16, color: '#94a3b8' }}>Eje Este · 2026</span>
            </div>
          </div>
          <div style={{
            background: stateColor, color: 'white',
            padding: '10px 22px', borderRadius: 999,
            fontSize: 22, fontWeight: 900, letterSpacing: 2,
          }}>
            {stateLabel}
          </div>
        </div>

        {/* Marcador */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
        }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            maxWidth: 380,
          }}>
            <span style={{ fontSize: 14, color: '#94a3b8', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>LOCAL</span>
            <span style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.05 }}>{local}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 26 }}>
            <span style={{ fontSize: 140, fontWeight: 900, color: '#f97316', lineHeight: 1 }}>{ml}</span>
            <span style={{ fontSize: 60, color: '#475569' }}>·</span>
            <span style={{ fontSize: 140, fontWeight: 900, color: '#f97316', lineHeight: 1 }}>{mv}</span>
          </div>

          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
            maxWidth: 380,
          }}>
            <span style={{ fontSize: 14, color: '#94a3b8', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>VISITANTE</span>
            <span style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.05, textAlign: 'right' }}>{visit}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 18, color: '#94a3b8' }}>
            {CAT_LABELS[categoria] ?? categoria}
            {partido.grupo ? `  ·  GRUPO ${partido.grupo}` : ''}
            {partido.fase && partido.fase !== 'REGULAR' ? `  ·  ${partido.fase}` : ''}
          </span>
          <span style={{ fontSize: 16, color: '#64748b' }}>
            {partido.fechaAsignada} {partido.hora ? `· ${partido.hora}` : ''}
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
