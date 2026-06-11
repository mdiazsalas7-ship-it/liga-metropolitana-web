'use client';

// Modal tipo "trading card" Upper Deck — estilo idéntico al de la app vieja.
// Fondo oscuro premium, foto grande, número decorativo, accent color por jugador,
// stats grid de 4 columnas con glassmorphism.

import Link from 'next/link';
import { useEffect } from 'react';
import { LEAGUE_LOGO_URL } from '@/lib/site';
import type { Jugador } from '@/types';

// Paleta de colores accent del modal — un color por jugador, hash del nombre.
const ACCENT_PALETTE = [
  '#1e3a8a', // navy
  '#0369a1', // sky
  '#065f46', // teal
  '#7c2d12', // brown-red
  '#4c1d95', // violet
  '#831843', // pink-dark
  '#92400e', // amber-dark
  '#134e4a', // teal-dark
];

const LEAGUE_LOGO = LEAGUE_LOGO_URL;

function accentOf(nombre?: string): string {
  if (!nombre) return ACCENT_PALETTE[0];
  let h = 0;
  for (let i = 0; i < nombre.length; i++) h += nombre.charCodeAt(i);
  return ACCENT_PALETTE[h % ACCENT_PALETTE.length];
}

interface Props {
  jugador: Jugador | null;
  categoriaId: string;
  equipoNombre?: string;
  equipoLogoUrl?: string;
  onClose: () => void;
}

export function PlayerCardModal({
  jugador, categoriaId, equipoNombre, onClose,
}: Props) {
  // ESC para cerrar + bloquea scroll del body
  useEffect(() => {
    if (!jugador) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [jugador, onClose]);

  if (!jugador) return null;

  const accent = accentOf(jugador.nombre);
  const pj    = jugador.partidosJugados || 0;
  const noPJ  = pj === 0;

  // Igual que la app: 4 stats principales, con total y avg/PJ
  const stats = [
    { label: 'PTS', icon: '🔥', color: '#ef4444', total: jugador.puntos  ?? 0 },
    { label: 'REB', icon: '🖐️', color: '#10b981', total: jugador.rebotes ?? 0 },
    { label: 'ROB', icon: '🛡️', color: '#6366f1', total: jugador.robos   ?? 0 },
    { label: '3PT', icon: '🏹', color: '#8b5cf6', total: jugador.triples ?? 0 },
  ].map(s => ({
    ...s,
    avg: noPJ ? '—' : (s.total / Math.max(pj, 1)).toFixed(1),
  }));

  const teamNombre = (equipoNombre || jugador.equipoNombre || '').toUpperCase();
  const nombreUp   = (jugador.nombre || '').toUpperCase();
  const initial    = (jugador.nombre || '?').charAt(0).toUpperCase();

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-[340px] rounded-3xl overflow-hidden"
        style={{
          background: '#080c18',
          boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px ${accent}44`,
          fontFamily: "'Inter','Segoe UI',sans-serif",
        }}
      >
        {/* Franja superior de color */}
        <div
          className="h-1"
          style={{ background: `linear-gradient(90deg, ${accent}, ${accent}44, transparent)` }}
        />

        {/* HEADER: foto + número + badge */}
        <div
          className="relative h-80 overflow-hidden"
          style={{ background: `linear-gradient(160deg, ${accent}22, #080c18)` }}
        >
          {/* Shine lateral */}
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse at 30% 50%, ${accent}15, transparent 70%)` }}
          />

          {/* Número gigante decorativo */}
          {jugador.numero != null && (
            <div
              className="absolute -right-3 -bottom-5 font-black select-none leading-none pointer-events-none"
              style={{
                fontSize: '9rem',
                color: 'rgba(255,255,255,0.05)',
              }}
            >
              {jugador.numero}
            </div>
          )}

          {/* Foto o iniciales */}
          {jugador.fotoUrl ? (
            <img
              src={jugador.fotoUrl}
              alt={jugador.nombre}
              className="w-full h-full object-cover object-center"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="rounded-full flex items-center justify-center font-black text-white"
                style={{
                  width: 110, height: 110, fontSize: '3.5rem',
                  background: `radial-gradient(circle, ${accent}cc, ${accent}44)`,
                  border: `2px solid ${accent}66`,
                  boxShadow: `0 0 40px ${accent}44`,
                }}
              >
                {initial}
              </div>
            </div>
          )}

          {/* Fade bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-20"
            style={{ background: 'linear-gradient(to top, #080c18, transparent)' }}
          />

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full text-white text-sm font-black flex items-center justify-center backdrop-blur"
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            ✕
          </button>

          {/* Badge dorsal */}
          {jugador.numero != null && (
            <div
              className="absolute top-2.5 left-2.5 text-white font-black text-xs px-3 py-0.5 rounded-full"
              style={{
                background: accent,
                boxShadow: `0 4px 12px ${accent}66`,
              }}
            >
              #{jugador.numero}
            </div>
          )}
        </div>

        {/* INFO + STATS */}
        <div className="px-3 pb-3 pt-2" style={{ background: '#080c18' }}>
          {/* Nombre + equipo */}
          <div className="text-center mb-3">
            <div className="font-black text-lg text-white uppercase tracking-wide">
              {nombreUp}
            </div>
            <div
              className="text-[10px] font-bold uppercase mt-0.5"
              style={{ color: accent, letterSpacing: '1.5px' }}
            >
              {teamNombre}
            </div>
          </div>

          {/* Divider */}
          <div
            className="h-px mb-3"
            style={{ background: `linear-gradient(90deg, transparent, ${accent}66, transparent)` }}
          />

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-1 mb-3">
            {stats.map(s => (
              <div
                key={s.label}
                className="relative rounded-xl py-1.5 px-1 text-center overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${s.color}33`,
                }}
              >
                {/* Acento superior */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
                  style={{ background: s.color }}
                />
                <div className="text-sm mb-0.5">{s.icon}</div>
                <div
                  className="text-2xl font-black text-white leading-none"
                  style={{ textShadow: `0 0 12px ${s.color}88` }}
                >
                  {s.total}
                </div>
                <div className="text-[9px] text-white/35 mt-0.5">{s.avg}/PJ</div>
                <div
                  className="text-[9px] font-black mt-0.5"
                  style={{ color: s.color, letterSpacing: '0.5px' }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Logo liga + botón ver perfil */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
              style={{ border: `1px solid ${accent}44` }}
            >
              <img src={LEAGUE_LOGO} alt="Liga" className="w-full h-full object-cover" />
            </div>
            <Link
              href={`/jugador/${jugador.id}?categoria=${categoriaId}`}
              className="flex-1 text-center py-2.5 rounded-xl text-white font-black text-xs tracking-wider transition-all"
              style={{
                background: `linear-gradient(90deg, ${accent}, ${accent}bb)`,
                boxShadow: `0 4px 16px ${accent}55`,
              }}
            >
              VER PERFIL COMPLETO →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
