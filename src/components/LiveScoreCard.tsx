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

  return (
    <Link
      href={`/partido/${partidoIdInicial}?categoria=${categoriaInicial}`}
      className="block rounded-2xl border-2 border-liga-coral bg-white shadow-hero overflow-hidden card-hover"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-liga-coralSoft border-b border-liga-coral/20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-liga-live pulse-live" />
          <span className="text-[11px] font-extrabold text-liga-live tracking-widest uppercase">
            En vivo
          </span>
          {cuarto && (
            <span className="text-[11px] font-bold text-liga-coralDark ml-2">
              {cuarto} en curso
            </span>
          )}
        </div>
        <span className="text-[11px] text-liga-coralDark font-bold uppercase tracking-wider">
          {CAT_LABELS[categoriaInicial] ?? categoriaInicial}
          {partido.grupo ? ` · Grupo ${partido.grupo}` : ''}
        </span>
      </div>

      {/* Marcador */}
      <div className="px-5 sm:px-7 py-5 sm:py-7">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
          {/* Local */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <TeamLogo nombre={local} size={56} ring />
            <div className="min-w-0">
              <p className="font-extrabold text-sm sm:text-lg leading-tight truncate">{local}</p>
              <p className="text-[11px] text-[var(--color-text-dim)] mt-0.5">Local</p>
            </div>
          </div>

          {/* Marcador */}
          <div className={
            'flex items-baseline gap-3 sm:gap-5 tabular-nums transition-transform ' +
            (pegado ? 'scale-110' : '')
          }>
            <span className="text-5xl sm:text-7xl font-extrabold text-[var(--color-text)] leading-none">{ml}</span>
            <span className="text-2xl text-[var(--color-text-dim2)]">·</span>
            <span className="text-5xl sm:text-7xl font-extrabold text-[var(--color-text)] leading-none">{mv}</span>
          </div>

          {/* Visitante */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 justify-end">
            <div className="min-w-0 text-right">
              <p className="font-extrabold text-sm sm:text-lg leading-tight truncate">{visit}</p>
              <p className="text-[11px] text-[var(--color-text-dim)] mt-0.5">Visitante</p>
            </div>
            <TeamLogo nombre={visit} size={56} ring />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-liga-dark text-white px-5 py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider">
        Ver partido en vivo →
      </div>
    </Link>
  );
}
