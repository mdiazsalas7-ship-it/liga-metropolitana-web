'use client';

// Modal estilo "trading card" Upper Deck.
// Se abre al click sobre un jugador del roster del equipo.

import Link from 'next/link';
import { useEffect } from 'react';
import { TeamLogo } from './TeamLogo';
import type { Jugador } from '@/types';

interface Props {
  jugador: Jugador | null;
  categoriaId: string;
  equipoNombre?: string;
  equipoLogoUrl?: string;
  onClose: () => void;
}

// Hashea el nombre del equipo a una paleta consistente
const TEAM_PALETTES = [
  { primary: '#1e40af', soft: '#dbeafe', name: 'azul' },
  { primary: '#7c3aed', soft: '#ede9fe', name: 'purpura' },
  { primary: '#0f766e', soft: '#ccfbf1', name: 'teal' },
  { primary: '#b91c1c', soft: '#fee2e2', name: 'rojo' },
  { primary: '#D85A30', soft: '#FAECE7', name: 'coral' },
  { primary: '#a16207', soft: '#fef3c7', name: 'ambar' },
  { primary: '#15803d', soft: '#dcfce7', name: 'verde' },
  { primary: '#be185d', soft: '#fce7f3', name: 'rosa' },
];

function hashColor(nombre?: string) {
  if (!nombre) return TEAM_PALETTES[0];
  let h = 0;
  for (let i = 0; i < nombre.length; i++) h = (h * 31 + nombre.charCodeAt(i)) >>> 0;
  return TEAM_PALETTES[h % TEAM_PALETTES.length];
}

export function PlayerCardModal({
  jugador, categoriaId, equipoNombre, equipoLogoUrl, onClose,
}: Props) {
  // ESC para cerrar
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

  const palette = hashColor(equipoNombre || jugador.equipoNombre);
  const pj = jugador.partidosJugados || 0;
  const ppp = pj > 0 ? ((jugador.puntos     ?? 0) / pj).toFixed(1) : '0.0';
  const rpp = pj > 0 ? ((jugador.rebotes    ?? 0) / pj).toFixed(1) : '0.0';
  const tpp = pj > 0 ? ((jugador.triples    ?? 0) / pj).toFixed(1) : '0.0';
  const spp = pj > 0 ? ((jugador.robos      ?? 0) / pj).toFixed(1) : '0.0';
  const bpp = pj > 0 ? ((jugador.bloqueos   ?? 0) / pj).toFixed(1) : '0.0';
  const tlpp= pj > 0 ? ((jugador.tirosLibres?? 0) / pj).toFixed(1) : '0.0';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      style={{ background: 'rgba(0, 0, 0, 0.75)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl overflow-hidden w-full max-w-md sm:max-w-lg shadow-2xl max-h-[95vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{
          border: `3px solid ${palette.primary}`,
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-zinc-700 font-bold text-lg"
          aria-label="Cerrar"
        >
          ×
        </button>

        {/* HEADER de la card: número gigante y banda del color del equipo */}
        <div
          className="relative h-44 sm:h-52 overflow-hidden"
          style={{ background: palette.primary }}
        >
          {/* Patrón de líneas diagonales para textura */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(255,255,255,0.15) 12px, rgba(255,255,255,0.15) 14px)`,
            }}
          />
          {/* Número gigante de fondo */}
          {jugador.numero != null && (
            <span
              className="absolute -bottom-6 -right-3 font-extrabold leading-none select-none pointer-events-none"
              style={{
                fontSize: 'clamp(140px, 35vw, 200px)',
                color: 'rgba(255, 255, 255, 0.15)',
                lineHeight: 0.85,
              }}
            >
              {jugador.numero}
            </span>
          )}
          {/* Top tag */}
          <div className="relative px-5 pt-4 flex items-center justify-between">
            <span className="inline-block bg-white text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-full" style={{ color: palette.primary }}>
              Player Card
            </span>
            <span className="inline-block bg-black/30 backdrop-blur text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full">
              {categoriaId.replace('_', ' ')}
            </span>
          </div>
          {/* Foto + nombre */}
          <div className="relative px-5 pt-4 flex items-end gap-3 h-full">
            <div className="absolute bottom-3 left-5 flex items-end gap-3 sm:gap-4">
              <div className="bg-white rounded-full p-1 shadow-lg">
                <TeamLogo
                  nombre={jugador.nombre}
                  logoUrl={jugador.fotoUrl}
                  size={84}
                />
              </div>
              <div className="pb-1 text-white">
                <p className="text-[10px] uppercase tracking-widest opacity-80 font-bold">
                  #{jugador.numero ?? '–'}
                </p>
                <p className="text-xl sm:text-2xl font-extrabold leading-tight drop-shadow-md">
                  {jugador.nombre}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Equipo */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-[var(--color-border)]" style={{ background: palette.soft }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <TeamLogo nombre={equipoNombre || jugador.equipoNombre} logoUrl={equipoLogoUrl} size={32} />
            <div className="min-w-0">
              <p className="font-extrabold text-sm truncate" style={{ color: palette.primary }}>
                {equipoNombre || jugador.equipoNombre}
              </p>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-bold">
                {jugador.grupo ? `Grupo ${jugador.grupo}` : 'Temporada 2026'}
              </p>
            </div>
          </div>
          <span className="text-right">
            <span className="text-2xl font-extrabold tabular-nums leading-none" style={{ color: palette.primary }}>
              {pj}
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-zinc-600 font-bold">PJ</span>
          </span>
        </div>

        {/* Stats principales */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-extrabold tracking-widest uppercase text-zinc-500 mb-2">
            Promedios por partido
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'PPP',      value: ppp, bg: '#FAECE7', fg: '#993C1D' },
              { label: 'REB',      value: rpp, bg: '#dcfce7', fg: '#15803d' },
              { label: 'TRIPLES',  value: tpp, bg: '#ede9fe', fg: '#7c3aed' },
              { label: 'ROBOS',    value: spp, bg: '#dbeafe', fg: '#1e40af' },
              { label: 'BLOQUEOS', value: bpp, bg: '#fee2e2', fg: '#b91c1c' },
              { label: 'T. LIBRES',value: tlpp,bg: '#f4f4f5', fg: '#52525b' },
            ].map(s => (
              <div key={s.label} className="rounded-lg p-2.5 text-center" style={{ background: s.bg }}>
                <p className="text-2xl font-extrabold tabular-nums leading-none" style={{ color: s.fg }}>{s.value}</p>
                <p className="text-[9px] uppercase tracking-widest font-bold mt-1" style={{ color: s.fg }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Totales acumulados */}
          <p className="text-[10px] font-extrabold tracking-widest uppercase text-zinc-500 mt-5 mb-2">
            Totales acumulados
          </p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'PTS',  value: jugador.puntos      ?? 0 },
              { label: 'REB',  value: jugador.rebotes     ?? 0 },
              { label: '3P',   value: jugador.triples     ?? 0 },
              { label: '2P',   value: jugador.dobles      ?? 0 },
            ].map(s => (
              <div key={s.label} className="rounded bg-zinc-50 border border-[var(--color-border)] py-2">
                <p className="text-lg font-extrabold tabular-nums leading-none text-zinc-900">{s.value}</p>
                <p className="text-[9px] uppercase tracking-widest font-bold text-zinc-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-[var(--color-border)] bg-zinc-50 px-5 py-3 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Cerrar
          </button>
          <Link
            href={`/jugador/${jugador.id}?categoria=${categoriaId}`}
            className="flex-1 text-center bg-liga-dark hover:bg-liga-darkSoft text-white text-xs font-extrabold px-4 py-2.5 rounded-lg uppercase tracking-wider transition-colors"
          >
            Ver perfil completo →
          </Link>
        </div>
      </div>
    </div>
  );
}
