'use client';

// Card del partido en vivo en la home. Hero con borde coral fuerte y
// suscripción onSnapshot para que el marcador se actualice en tiempo real.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onSnapshot, doc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { colName, type CategoriaId } from '@/lib/categorias';
import { TeamLogo } from './TeamLogo';
import type { Partido } from '@/types';

const CAT_LABELS: Record<string, string> = {
  INTERINDUSTRIAL: 'Interindustrial',
  U16_FEMENINO:    'U16 Femenino',
  U16M:            'U16M',
  MASTER40:        'Master 40',
  LIBRE:           'Libre',
};

function getCurrentQuarter(p: Partido | null): string {
  if (!p?.cuartosLocal) return '';
  const q = ['Q4', 'Q3', 'Q2', 'Q1'];
  for (const k of q) {
    if ((p.cuartosLocal?.[k] ?? 0) > 0 || (p.cuartosVisitante?.[k] ?? 0) > 0) return k;
  }
  return 'Q1';
}

export function LiveScoreCard({
  partidoIdInicial,
  categoriaInicial,
  partidoInicial,
}: {
  partidoIdInicial: string;
  categoriaInicial: CategoriaId;
  partidoInicial: Partido;
}) {
  const [partido, setPartido] = useState<Partido>(partidoInicial);
  const [pegado, setPegado]   = useState(false);

  useEffect(() => {
    const ref = doc(getDb(), colName('calendario', categoriaInicial), partidoIdInicial);
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as Partido;
        setPartido(prev => {
          if (prev.marcadorLocal !== data.marcadorLocal || prev.marcadorVisitante !== data.marcadorVisitante) {
            setPegado(true);
            setTimeout(() => setPegado(false), 600);
          }
          return data;
        });
      }
    });
    return () => unsub();
  }, [partidoIdInicial, categoriaInicial]);

  if (!partido.enVivo) return null;

  const cuarto = getCurrentQuarter(partido);
  const local  = partido.equipoLocalNombre     ?? 'Local';
  const visit  = partido.equipoVisitanteNombre ?? 'Visitante';
  const ml     = partido.marcadorLocal     ?? 0;
  const mv     = partido.marcadorVisitante ?? 0;
  const localGana = ml >= mv;

  return (
    <Link
      href={`/partido/${partidoIdInicial}?categoria=${categoriaInicial}`}
      className="block rounded-3xl overflow-hidden card-hover shadow-hero relative"
      style={{
        background:
          'radial-gradient(700px 300px at 100% 0%, rgba(255,90,48,0.18), transparent 60%), linear-gradient(180deg, var(--color-card-2), var(--color-bg-alt))',
        border: '1px solid rgba(255,90,48,0.35)',
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-liga-live pulse-live" />
          <span className="text-[11px] font-extrabold text-liga-live tracking-[0.13em] uppercase">
            En vivo
          </span>
          {cuarto && (
            <span className="text-[11px] font-bold text-liga-coral ml-2">
              {cuarto} en curso
            </span>
          )}
        </div>
        <span className="text-[11px] text-[var(--color-text-dim)] font-bold uppercase tracking-wider">
          {CAT_LABELS[categoriaInicial] ?? categoriaInicial}
          {partido.grupo ? ` · Grupo ${partido.grupo}` : ''}
        </span>
      </div>

      {/* Marcador */}
      <div className="px-5 sm:px-7 py-7 sm:py-9">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
          {/* Local */}
          <div className="flex flex-col items-center gap-3 text-center min-w-0">
            <TeamLogo nombre={local} size={60} ring />
            <p className="font-extrabold text-sm sm:text-lg leading-tight truncate max-w-full">{local}</p>
          </div>

          {/* Marcador */}
          <div className={
            'flex items-center gap-3 sm:gap-5 tabular-nums transition-transform duration-300 ' +
            (pegado ? 'scale-110' : '')
          }>
            <span className={
              'cond text-6xl sm:text-8xl font-black leading-[0.8] ' +
              (localGana ? 'text-white' : 'text-[var(--color-text-dim2)]')
            }>{ml}</span>
            <span className="cond text-3xl sm:text-5xl font-light text-[var(--color-text-dim2)]">·</span>
            <span className={
              'cond text-6xl sm:text-8xl font-black leading-[0.8] ' +
              (!localGana ? 'text-white' : 'text-[var(--color-text-dim2)]')
            }>{mv}</span>
          </div>

          {/* Visitante */}
          <div className="flex flex-col items-center gap-3 text-center min-w-0">
            <TeamLogo nombre={visit} size={60} ring />
            <p className="font-extrabold text-sm sm:text-lg leading-tight truncate max-w-full">{visit}</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-black/25 border-t border-[var(--color-border)] text-liga-coral px-5 py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.1em]">
        Ver partido en vivo →
      </div>
    </Link>
  );
}
